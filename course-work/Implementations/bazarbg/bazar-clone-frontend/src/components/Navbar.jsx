import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Bell,
  Heart,
  Menu,
  MessageCircle,
  Plus,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { currentUser, isAuthenticated, logout } from "../auth";
import { apiRequest } from "../api";
import bazarLogo from "../assets/bazar-logo.svg";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [user, setUser] = useState(currentUser());
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef(null);

  function refreshAuthState() {
    setLoggedIn(isAuthenticated());
    setUser(currentUser());
  }

  async function loadUnreadCount() {
    if (!isAuthenticated()) {
      setUnreadCount(0);
      return;
    }

    try {
      const data = await apiRequest("/messages/unread-count");
      setUnreadCount(data.unread_count || 0);
    } catch {
      setUnreadCount(0);
    }
  }

  function handleLogoutClick() {
    setProfileMenuOpen(false);
    logout();
  }

  useEffect(() => {
    refreshAuthState();
    loadUnreadCount();

    window.addEventListener("authChanged", refreshAuthState);
    window.addEventListener("storage", refreshAuthState);

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 4000);

    return () => {
      window.removeEventListener("authChanged", refreshAuthState);
      window.removeEventListener("storage", refreshAuthState);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [loggedIn]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bazar-header">
      <div className="bazar-container header-inner">
        <Link to="/" className="bazar-logo">
          <img src={bazarLogo} alt="Bazar" className="bazar-logo-img" />
        </Link>

        <div className="header-slogan">Сайт за безплатни обяви!</div>

        <nav className="header-actions">
          {loggedIn && (
            <>
              {user?.is_admin && (
                <NavLink to="/admin" className="header-icon-link admin-nav-link" title="Админ меню">
                  <ShieldCheck size={31} strokeWidth={2.5} />
                </NavLink>
              )}

              <NavLink to="/favorites" className="header-icon-link" title="Любими">
                <Heart size={31} strokeWidth={2.5} />
              </NavLink>

              <NavLink to="/messages" className="header-icon-link message-nav-item" title="Съобщения">
                <MessageCircle size={31} strokeWidth={2.4} />

                {unreadCount > 0 && (
                  <span className="message-badge">
                    {unreadCount}
                  </span>
                )}
              </NavLink>

              <a href="#" className="header-icon-link" title="Известия">
                <Bell size={31} strokeWidth={2.4} />
              </a>

              <div className="profile-dropdown-wrap" ref={profileMenuRef}>
                <button
                  type="button"
                  className="profile-dropdown-button"
                  onClick={() => setProfileMenuOpen((current) => !current)}
                >
                  <UserRound size={31} strokeWidth={2.4} />
                  <span>{user?.username || "Потребител 4569849"}</span>
                  <small>▾</small>
                </button>

                {profileMenuOpen && (
                  <div className="profile-dropdown-menu">
                    <section className="profile-dropdown-section">
                      <h3>
                        <Menu size={18} />
                        Моят профил:
                      </h3>

                      {user?.is_admin && (
                        <Link to="/admin" onClick={() => setProfileMenuOpen(false)}>
                          Админ меню
                        </Link>
                      )}

                      <Link to="/my-ads" onClick={() => setProfileMenuOpen(false)}>
                        Моите обяви
                      </Link>

                      <Link to="/messages" onClick={() => setProfileMenuOpen(false)}>
                        Съобщения
                      </Link>

                      <a href="#" onClick={() => setProfileMenuOpen(false)}>
                        Известия
                      </a>

                      <a href="#" onClick={() => setProfileMenuOpen(false)}>
                        Портфейл
                      </a>

                      <Link to="/delivery" onClick={() => setProfileMenuOpen(false)}>
                        Доставка
                      </Link>
                    </section>

                    <section className="profile-dropdown-section favorites-section">
                      <h3>
                        <Heart size={19} fill="#b6c3ce" color="#b6c3ce" />
                        Любими:
                      </h3>

                      <Link to="/favorites" onClick={() => setProfileMenuOpen(false)}>
                        Обяви
                      </Link>

                      <a href="#" onClick={() => setProfileMenuOpen(false)}>
                        Търсения
                      </a>

                      <a href="#" onClick={() => setProfileMenuOpen(false)}>
                        Потребители
                      </a>
                    </section>

                    <section className="profile-dropdown-section profile-dropdown-bottom">
                      <Link to="/settings" onClick={() => setProfileMenuOpen(false)}>
                        Настройки
                      </Link>

                      <button type="button" onClick={handleLogoutClick}>
                        Изход
                      </button>
                    </section>
                  </div>
                )}
              </div>

              <Link to="/create-ad" className="add-ad-button">
                <Plus size={22} strokeWidth={3} />
                ДОБАВИ ОБЯВА
              </Link>
            </>
          )}

          {!loggedIn && (
            <>
              <Link to="/login" className="profile-link">
                <UserRound size={31} strokeWidth={2.4} />
                <span>Вход</span>
              </Link>

              <Link to="/register" className="add-ad-button">
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
