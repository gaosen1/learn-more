'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'My Courses', href: '/dashboard' },
  { name: 'Create Course', href: '/create' },
  { name: 'About', href: '/about' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Link
              href="/login"
              className="btn btn-primary"
            >
              Login
            </Link>
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
                <Link
                  href="/login"
                  className="btn btn-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 