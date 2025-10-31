import React, { useState, useEffect } from "react";
import "../styles/vet-card.css";

function normalizePhone(raw) {
  // returns { display: string, tel: string } or null
  if (!raw) return null;
  const s = String(raw).trim();
  const digitsOnly = s.replace(/[^0-9]/g, "");
  const startsPlus = s.startsWith("+");
  const starts00 = s.startsWith("00");

  const formatUruguay = (core) => {
    const last8 = core.slice(-8);
    return {
      display: `+598 ${last8.slice(0,4)} ${last8.slice(4)}`,
      tel: `+598${last8}`,
    };
  };

  if (startsPlus && digitsOnly.startsWith("598") && digitsOnly.slice(3).length >= 8) {
    return formatUruguay(digitsOnly.slice(3));
  }
  if (starts00 && digitsOnly.startsWith("00598") && digitsOnly.slice(5).length >= 8) {
    return formatUruguay(digitsOnly.slice(5));
  }
  if (!startsPlus && !starts00 && digitsOnly.length === 8) {
    return formatUruguay(digitsOnly);
  }
  if (digitsOnly.startsWith("598") && digitsOnly.slice(3).length === 8) {
    return formatUruguay(digitsOnly.slice(3));
  }
  if (digitsOnly.length > 0) {
    return { display: s, tel: `+${digitsOnly}` };
  }
  return null;
}

export default function VetCard({ place, onClose }) {
  if (!place) return null;

  const { name, address, phone, rating, reviews_count, reviews } = place;
  const normalized = normalizePhone(phone);
  const displayPhone = normalized ? normalized.display : phone;
  const telHref = normalized ? `tel:${normalized.tel}` : null;

  // derive photo URL and source
  // Only return a photo when it's actually available (Google Places photo or explicit URL).
  // If no photo is available, return null so the card shows the SVG placeholder instead
  const getPhotoUrl = (p) => {
    if (!p) return null;
    if (Array.isArray(p.photos) && p.photos.length) {
      const ph = p.photos[0];
      try {
        if (ph && typeof ph.getUrl === 'function') {
          const url = ph.getUrl({ maxWidth: 1200, maxHeight: 900 });
          if (url) return { url, source: 'google' };
        }
      } catch (e) {}
      if (ph && ph.url) return { url: ph.url, source: 'local' };
    }
    if (p.photo && typeof p.photo === 'string') return { url: p.photo, source: 'local' };
    if (p.photoUrl && typeof p.photoUrl === 'string') return { url: p.photoUrl, source: 'local' };
    if (p.icon && typeof p.icon === 'string') return { url: p.icon, source: 'icon' };
    return null;
  };

  const photoSrcObj = getPhotoUrl(place);
  const photoSrc = photoSrcObj?.url;
  const photoSource = photoSrcObj?.source;

  const [imgLoaded, setImgLoaded] = useState(false);
  useEffect(() => { setImgLoaded(false); }, [photoSrc]);

  const renderStars = (r) => {
    if (r === null || typeof r === 'undefined') return null;
    const filled = Math.round(r);
    const total = 5;
    return (
      <span className="vet-card__stars" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={i < filled ? 'vet-card__star--filled' : 'vet-card__star--empty'}>★</span>
        ))}
        <span className="vet-card__rating-number">{r ? Number(r).toFixed(1) : '—'}</span>
      </span>
    );
  };

  return (
    <aside className="vet-card">
      <div className="vet-card__media" aria-hidden>
        <div className="vet-card__img-placeholder" aria-hidden>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect width="24" height="24" rx="4" fill="#0b1220" />
            <path d="M12 7.5v5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.5 10h5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="16.5" r="1.6" fill="#fff"/>
          </svg>
        </div>

        {photoSrc ? (
          <>
            <img
              className={`vet-card__img ${imgLoaded ? 'loaded' : 'loading'}`}
              src={photoSrc}
              alt={name || 'Veterinaria'}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              onError={(e)=>{ e.currentTarget.style.display='none'; setImgLoaded(false); }}
            />
            {photoSource === 'google' ? <span className="vet-card__photo-badge">Foto</span> : null}
          </>
        ) : null}
      </div>

      <div className="vet-card__body">
        <div className="vet-card__header">
          <h3 className="vet-card__title">{name}</h3>
          <button className="vet-card__close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        {address ? <div className="vet-card__address">{address}</div> : null}
        {displayPhone ? <div className="vet-card__phone">📞 {displayPhone}</div> : null}

        <div className="vet-card__meta">
          <div className="vet-card__rating">
            {renderStars(rating)}
            <div className="vet-card__reviews-count">{reviews_count ?? (reviews && reviews.length) ?? 0} reseñas</div>
          </div>
        </div>

        {reviews && reviews.length ? (
          <div className="vet-card__reviews">
            {reviews.map((r, i) => (
              <div key={i} className="vet-card__review">
                <div className="vet-card__review-author">{r.author}</div>
                <div className="vet-card__review-text">{r.text}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="vet-card__no-reviews">Sin reseñas disponibles</div>
        )}

        <div className="vet-card__actions">
          {telHref ? (
            <a className="vet-card__btn vet-card__btn--call" href={telHref}>Llamar</a>
          ) : null}
          <a className="vet-card__btn vet-card__btn--primary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + (address||''))}`} target="_blank" rel="noreferrer">Cómo llegar</a>
        </div>
      </div>
    </aside>
  );
}
