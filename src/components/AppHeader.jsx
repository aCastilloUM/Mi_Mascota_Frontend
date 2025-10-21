import "../styles/animated-surfaces.css";
import "../styles/app-header.css";

export default function AppHeader({
  eyebrow,
  title,
  subtitle,
  actionSlot,
  className = "",
}) {
  const headerClass = [
    "app-header",
    "surface-animated",
    "surface-animated--header",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClass}>
      <div className="surface-animated__inner">
        <div className="app-header__text">
          {eyebrow ? <span className="app-header__eyebrow">{eyebrow}</span> : null}
          <h1 className="app-header__title">{title}</h1>
          {subtitle ? <p className="app-header__subtitle">{subtitle}</p> : null}
        </div>
        {actionSlot ? <div className="app-header__action">{actionSlot}</div> : null}
      </div>
    </header>
  );
}
