import { useEffect, useRef } from "react";

function createBeam(width, height) {
    const angle = -35 + Math.random() * 10;
    return {
        x: Math.random() * width * 1.5 - width * 0.25,
        y: Math.random() * height * 1.5 - height * 0.25,
        width: 30 + Math.random() * 60,
        length: height * 2.5,
        angle: angle,
        speed: 0.6 + Math.random() * 1.2,
        opacity: 0.15 + Math.random() * 0.20,
        hue: 180 + Math.random() * 40, // Tonos celestes/azules
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
    };
}

// Detectar si es un dispositivo móvil
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth < 768;
};

export function BeamsBackground({ className = "", children, intensity = "medium" }) {
    const canvasRef = useRef(null);
    const beamsRef = useRef([]);
    const animationFrameRef = useRef(0);
    const lastFrameTimeRef = useRef(0);
    const MINIMUM_BEAMS = isMobileDevice() ? 10 : 20; // Menos beams en móviles

    const opacityMap = {
        subtle: 0.7,
        medium: 0.85,
        strong: 1,
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Mantener las dimensiones en "CSS pixels" para usar en dibujo/posición
        let cssWidth = 0;
        let cssHeight = 0;

        const updateCanvasSize = () => {
            // Optimización para móviles: usar devicePixelRatio más conservador
            const dpr = isMobileDevice() ? Math.min(window.devicePixelRatio || 1, 2) : window.devicePixelRatio || 1;
            const width = window.innerWidth;
            const height = window.innerHeight;

            cssWidth = width;
            cssHeight = height;

            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            // Evitar acumulación de escala en redimensiones
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const totalBeams = Math.floor(MINIMUM_BEAMS * (isMobileDevice() ? 1 : 1.5));
            beamsRef.current = Array.from({ length: totalBeams }, () =>
                createBeam(width, height)
            );
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        function resetBeam(beam, index, totalBeams) {
            if (!canvas) return beam;

            // Usar cssWidth / cssHeight (no device pixels) para posicionar
            const column = index % 3;
            const spacing = cssWidth / 3;

            beam.y = cssHeight + 100;
            beam.x =
                column * spacing +
                spacing / 2 +
                (Math.random() - 0.5) * spacing * 0.5;
            beam.width = 100 + Math.random() * 100;
            beam.speed = 0.5 + Math.random() * 0.4;
            beam.hue = 190 + (index * 70) / totalBeams; // Rango celeste
            beam.opacity = 0.2 + Math.random() * 0.1;
            beam.length = cssHeight * 2.5;
            return beam;
        }

        function drawBeam(ctx, beam) {
            ctx.save();
            ctx.translate(beam.x, beam.y);
            ctx.rotate((beam.angle * Math.PI) / 180);

            const pulsingOpacity =
                beam.opacity *
                (0.8 + Math.sin(beam.pulse) * 0.2) *
                opacityMap[intensity];

            // Usar tonos celestes más visibles (más saturación/luminosidad) y alpha controlada
            const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

            // stops: mantener transparencia en extremos pero colores más "celestes" en el centro
            gradient.addColorStop(0, `hsla(${beam.hue}, 90%, 80%, 0)`);
            gradient.addColorStop(
                0.12,
                `hsla(${beam.hue}, 90%, 75%, ${pulsingOpacity * 0.45})`
            );
            gradient.addColorStop(
                0.45,
                `hsla(${beam.hue}, 90%, 72%, ${pulsingOpacity * 0.9})`
            );
            gradient.addColorStop(
                0.65,
                `hsla(${beam.hue}, 90%, 72%, ${pulsingOpacity * 0.9})`
            );
            gradient.addColorStop(
                0.9,
                `hsla(${beam.hue}, 90%, 75%, ${pulsingOpacity * 0.45})`
            );
            gradient.addColorStop(1, `hsla(${beam.hue}, 90%, 80%, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
            ctx.restore();
        }

        function animate(currentTime) {
            if (!canvas || !ctx) return;

            // Optimización: Limitar FPS en móviles para mejor rendimiento
            const targetFPS = isMobileDevice() ? 30 : 60;
            const frameInterval = 1000 / targetFPS;

            if (currentTime - lastFrameTimeRef.current < frameInterval) {
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }

            lastFrameTimeRef.current = currentTime;

            // Limpiar en CSS pixels (coherente con transform)
            ctx.clearRect(0, 0, cssWidth, cssHeight);

            // Aplicar blur desde el contexto (ligeramente menor para no lavar colores)
            ctx.filter = isMobileDevice() ? "blur(14px)" : "blur(22px)";

            // Usar un modo de mezcla para mantener los colores y evitar bordes blancos fuertes
            const previousComposite = ctx.globalCompositeOperation;
            ctx.globalCompositeOperation = "screen";

            const totalBeams = beamsRef.current.length;
            beamsRef.current.forEach((beam, index) => {
                // Movimiento más suave en móviles
                const speedMultiplier = isMobileDevice() ? 0.8 : 1;
                beam.y -= beam.speed * speedMultiplier;
                beam.pulse += beam.pulseSpeed;

                if (beam.y + beam.length < -100) {
                    resetBeam(beam, index, totalBeams);
                }

                drawBeam(ctx, beam);
            });

            // restaurar modo de composición por si se reutiliza el contexto en otro sitio
            ctx.globalCompositeOperation = previousComposite;

            animationFrameRef.current = requestAnimationFrame(animate);
        }

        // Inicializar con timestamp
        const startAnimation = (timestamp) => {
            lastFrameTimeRef.current = timestamp;
            animate(timestamp);
        };
        
        animationFrameRef.current = requestAnimationFrame(startAnimation);

        // Manejar visibilidad para pausar/reanudar animación en móviles
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            } else {
                animationFrameRef.current = requestAnimationFrame(startAnimation);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [intensity]);

    return (
        <div className={`relative w-full overflow-hidden ${className}`}
             style={{ 
                 // Fondo celeste suave
                 background: 'linear-gradient(135deg, #9ce3f8ff 0%, #4e8cadff 50%, #59a0c9ff 100%)',
                 minHeight: '100vh',
                 position: 'fixed',
                 top: 0,
                 left: 0,
                 right: 0,
                 bottom: 0,
                 zIndex: 1
             }}>
            <canvas
                ref={canvasRef}
                className="absolute inset-0"
                style={{ pointerEvents: "none" }}
            />

            <div className="relative w-full h-full" style={{ zIndex: 10 }}>
                {children}
            </div>
        </div>
    );
}