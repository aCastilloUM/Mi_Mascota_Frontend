import { useEffect, useRef } from "react";
import { useResponsive } from "../../hooks/useResponsive";

function createBeam(width, height) {
    const angle = -35 + Math.random() * 10;
    return {
        x: Math.random() * width * 1.5 - width * 0.25,
        y: Math.random() * height * 1.5 - height * 0.25,
        width: 30 + Math.random() * 60,
        length: height * 2.5,
        angle,
        speed: 0.6 + Math.random() * 1.2,
        opacity: 0.15 + Math.random() * 0.2,
        hue: 180 + Math.random() * 40,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
    };
}

export function BeamsBackground({ className = "", children, intensity = "medium" }) {
    const canvasRef = useRef(null);
    const beamsRef = useRef([]);
    const animationRef = useRef(0);
    const lastRef = useRef(0);
    const { width, height } = useResponsive();
    const MINIMUM_BEAMS = Math.max(8, Math.floor((width || 800) / 60));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        const updateCanvasSize = () => {
            const w = Math.max(1, width || window.innerWidth);
            const h = Math.max(1, height || window.innerHeight);
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            beamsRef.current = Array.from({ length: MINIMUM_BEAMS }, () => createBeam(w, h));
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        const opacityMap = { subtle: 0.7, medium: 0.85, strong: 1 };

        function drawBeam(b) {
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate((b.angle * Math.PI) / 180);
            const pulsingOpacity = b.opacity * (0.8 + Math.sin(b.pulse) * 0.2) * (opacityMap[intensity] || 1);
            const g = ctx.createLinearGradient(0, 0, 0, b.length);
            g.addColorStop(0, `hsla(${b.hue},70%,75%,0)`);
            g.addColorStop(0.1, `hsla(${b.hue},70%,75%,${pulsingOpacity * 0.5})`);
            g.addColorStop(0.4, `hsla(${b.hue},70%,75%,${pulsingOpacity})`);
            g.addColorStop(0.6, `hsla(${b.hue},70%,75%,${pulsingOpacity})`);
            g.addColorStop(0.9, `hsla(${b.hue},70%,75%,${pulsingOpacity * 0.5})`);
            g.addColorStop(1, `hsla(${b.hue},70%,75%,0)`);
            ctx.fillStyle = g;
            ctx.fillRect(-b.width / 2, 0, b.width, b.length);
            ctx.restore();
        }

        function animate(time) {
            const target = isMobileDevice() ? 30 : 60;
            const intv = 1000 / target;
            if (time - lastRef.current < intv) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }
            lastRef.current = time;

            const w = canvas.width / dpr;
            const h = canvas.height / dpr;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.filter = `blur(${Math.max(12, Math.min((width || w) / 40, 40))}px)`;

            const total = beamsRef.current.length;
            beamsRef.current.forEach((b, idx) => {
                b.y -= b.speed * Math.max(0.7, Math.min((height || h) / 900, 1.2));
                b.pulse += b.pulseSpeed;
                if (b.y + b.length < -100) {
                    b.y = h + 100;
                    b.x = (idx % 3) * (w / 3) + w / 6 + (Math.random() - 0.5) * (w / 6);
                    b.width = 80 + Math.random() * 120;
                    b.speed = 0.5 + Math.random() * 0.6;
                    b.hue = 180 + (idx * 40) / total;
                    b.opacity = 0.25 + Math.random() * 0.15;
                }
                drawBeam(b);
            });

            animationRef.current = requestAnimationFrame(animate);
        }

        animationRef.current = requestAnimationFrame(animate);

        function onVisibility() {
            if (document.hidden) {
                if (animationRef.current) cancelAnimationFrame(animationRef.current);
            } else {
                animationRef.current = requestAnimationFrame(animate);
            }
        }

        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            document.removeEventListener('visibilitychange', onVisibility);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [width, height, intensity]);

    return (
        <>
            <div
                className={`relative w-full overflow-hidden ${className}`}
                style={{
                    background: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 50%, #1E90FF 100%)',
                    minHeight: '100vh',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                    pointerEvents: 'none'
                }}
            >
                <canvas ref={canvasRef} className="absolute inset-0" style={{ filter: 'blur(15px)' }} />
                <div className="absolute inset-0" style={{ background: 'rgba(135, 206, 235, 0.1)', backdropFilter: 'blur(50px)' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </>
    );
}
