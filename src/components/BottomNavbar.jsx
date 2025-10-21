import { NavLink } from "react-router-dom";
import { FiMapPin, FiBookmark, FiHeart, FiUser } from "react-icons/fi";

import "../styles/animated-surfaces.css";
import "../styles/bottom-navbar.css";

const defaultItems = [
  { label: "Mapa", to: "/home", icon: FiMapPin },
  { label: "Servicios", to: "/servicios", icon: FiBookmark },
  { label: "Favoritos", to: "/favoritos", icon: FiHeart },
  { label: "Perfil", to: "/perfil", icon: FiUser },
];

export default function BottomNavbar({ items = defaultItems, className = "" }) {
  const navClassName = [
    "bottom-navbar",
    "surface-animated",
    "surface-animated--navbar",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav
      className={navClassName}
      aria-label="Navegacion principal"
    >
      <div className="surface-animated__inner">
        <ul className="bottom-navbar__list">
          {items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <li key={item.to} className="bottom-navbar__item">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `bottom-navbar__link${isActive ? " bottom-navbar__link--active" : ""}`
                  }
                >
                  <ItemIcon className="bottom-navbar__icon" aria-hidden="true" focusable="false" />
                  <span className="bottom-navbar__label">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
