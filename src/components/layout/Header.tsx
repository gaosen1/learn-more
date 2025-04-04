'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/features' },
  { name: 'My Courses', href: '/dashboard' },
  { name: 'Create Course', href: '/create' },
  { name: 'About', href: '/about' },
];

interface NavigationItem {
  name: string;
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 在客户端检查用户登录状态
  useEffect(() => {
    // 这里可以使用您的实际登录状态检查逻辑
    // 例如：从localStorage或cookie中获取令牌
    const userToken = localStorage.getItem('userToken');
    setIsLoggedIn(!!userToken);
  }, []);

  // 用户导航项，根据登录状态显示不同的导航项
  const userNavigation: NavigationItem[] = isLoggedIn 
    ? [
        { name: 'Profile', href: '/profile' },
        { name: 'Settings', href: '/settings' },
        { name: 'Logout', href: '#', onClick: handleLogout }
      ] 
    : [];

  // 登出处理函数
  function handleLogout(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    // 清除登录令牌
    localStorage.removeItem('userToken');
    setIsLoggedIn(false);
    // 如果有需要，可以重定向到首页
    window.location.href = '/';
  }

  return (
    <header className={styles.header}>
      <nav className={`container ${styles.nav}`} aria-label="Global">
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <Link href="/" className={styles.logoLink}>
              <svg className={styles.logoIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span className={styles.logoText}>LearnMore</span>
            </Link>
          </div>
          <div className={styles.desktopNav}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={styles.navLink}
              >
                {item.name}
              </Link>
            ))}
            {isLoggedIn ? (
              <div className={styles.userMenu}>
                <div className={styles.userAvatar}>
                  <span className={styles.userInitials}>U</span>
                </div>
                <div className={styles.userDropdown}>
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={styles.userDropdownLink}
                      onClick={item.onClick}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary"
              >
                Login
              </Link>
            )}
          </div>
          <div className={styles.mobileNavButton}>
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className={styles.srOnly}>Open menu</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.menuIcon}>
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.backdrop} onClick={() => setMobileMenuOpen(false)} />
          <div className={styles.mobileMenuContent}>
            <div className={styles.mobileMenuHeader}>
              <Link href="/" className={styles.logoLink}>
                <svg className={styles.logoIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <span className={styles.logoText}>LearnMore</span>
              </Link>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={styles.srOnly}>Close menu</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.closeIcon}>
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
            <div className={styles.mobileMenuLinks}>
              <div className={styles.navLinks}>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={styles.mobileNavLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className={styles.mobileMenuFooter}>
                {isLoggedIn ? (
                  <div className={styles.mobileUserMenu}>
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={styles.mobileNavLink}
                        onClick={(e) => {
                          setMobileMenuOpen(false);
                          if (item.onClick) item.onClick(e);
                        }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="btn btn-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 