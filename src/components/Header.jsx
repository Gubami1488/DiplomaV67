import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from './Header.module.css';

function Header() {
  const { user, profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const getNavClassName = ({ isActive }) => (isActive ? `${styles.link} ${styles.activeLink}` : styles.link);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const onResize = () => {
      if (window.innerWidth > 900) {
        setMenuOpen(false);
      }
    };

    const onScroll = () => {
      setMenuOpen(false);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const onPointerDown = (event) => {
      const menuNode = menuRef.current;
      const buttonNode = menuButtonRef.current;
      const target = event.target;

      if (!menuNode || !buttonNode) {
        return;
      }

      if (menuNode.contains(target) || buttonNode.contains(target)) {
        return;
      }

      setMenuOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <img src="/icon-192.png" alt="PAX" className={styles.logoIcon} />
          <span>PAX</span>
        </Link>

        <nav className={styles.nav}>
          {user && (
            <>
              <NavLink to="/projects" className={getNavClassName} end>
                Проекты
              </NavLink>
              <NavLink to="/my-projects" className={getNavClassName}>
                Мои проекты
              </NavLink>
              <NavLink to="/profile" className={getNavClassName}>
                Профиль
              </NavLink>
            </>
          )}
        </nav>

        <div className={styles.actions}>
          {user ? (
            <div className={styles.authDesktop}>
              <span className={styles.userBadge}>
                <span>{profile?.name || user.email}</span>
                {profile?.photoDataUrl ? (
                  <img src={profile.photoDataUrl} alt={profile?.name || 'Пользователь'} className={styles.userAvatar} />
                ) : (
                  <span className={styles.userAvatarPlaceholder}>{(profile?.name || user.email).slice(0, 1).toUpperCase()}</span>
                )}
              </span>
              <button type="button" className={styles.buttonSecondary} onClick={logout}>
                Выйти
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className={styles.buttonSecondary}>
                Вход
              </Link>
              <Link to="/register" className={styles.buttonPrimary}>
                Регистрация
              </Link>
            </>
          )}

          {user && (
            <button
              type="button"
              ref={menuButtonRef}
              className={styles.menuButton}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Открыть меню"
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          )}
        </div>
      </div>

      {user && menuOpen && <button type="button" className={styles.mobileOverlay} onClick={closeMenu} aria-label="Закрыть меню" />}

      {user && (
        <aside ref={menuRef} className={menuOpen ? `${styles.mobileMenu} ${styles.mobileMenuOpen}` : styles.mobileMenu}>
          <div className={styles.mobileTop}>
            <span className={styles.userBadge}>
              <span>{profile?.name || user.email}</span>
              {profile?.photoDataUrl ? (
                <img src={profile.photoDataUrl} alt={profile?.name || 'Пользователь'} className={styles.userAvatar} />
              ) : (
                <span className={styles.userAvatarPlaceholder}>{(profile?.name || user.email).slice(0, 1).toUpperCase()}</span>
              )}
            </span>
          </div>

          <nav className={styles.mobileNav}>
            <NavLink to="/projects" className={getNavClassName} end onClick={closeMenu}>
              Проекты
            </NavLink>
            <NavLink to="/my-projects" className={getNavClassName} onClick={closeMenu}>
              Мои проекты
            </NavLink>
            <NavLink to="/profile" className={getNavClassName} onClick={closeMenu}>
              Профиль
            </NavLink>
          </nav>

          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={() => {
              closeMenu();
              logout();
            }}
          >
            Выйти
          </button>
        </aside>
      )}
    </header>
  );
}

export default Header;
