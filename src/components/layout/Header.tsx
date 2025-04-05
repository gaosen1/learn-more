'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/components/UserAuthProvider';
import { logout } from '@/utils/auth';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingDots } from '@/components/ui/loading';
import { useToast } from '@/components/ui/toast';
import styles from './Header.module.css';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Courses', href: '/courses' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
];

interface NavigationItem {
  name: string;
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export default function Header() {
  const { user, isAuthenticated, isLoading } = useUser();
  const [showMenu, setShowMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
      type: 'info'
    });
    router.push('/');
  };

  // Collect navigation items including conditional ones for authenticated users
  const navItems = [...navigation];
  if (isAuthenticated) {
    navItems.push({ name: 'My Courses', href: '/dashboard' });
    if (user?.role === 'EDUCATOR') {
      navItems.push({ name: 'Create Course', href: '/create' });
    }
    if (user?.role === 'EDUCATOR') {
      navItems.push({ name: 'Educator Portal', href: '/educator' });
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <Link href="/" className={styles.logoLink}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={styles.logoIcon}
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span className={styles.logoText}>LearnMore</span>
            </Link>
            {/* Desktop Navigation */}
            <nav className={styles.desktopNav}>
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`${styles.navLink} ${
                    pathname === item.href ? styles.activeNavLink : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className={styles.userSection}>
            {/* Hamburger menu button for mobile */}
            <button 
              className={styles.mobileNavButton} 
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className={styles.menuIcon}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {isLoading ? (
              <LoadingDots size="sm" />
            ) : isAuthenticated ? (
              <div className={styles.userMenu}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className={styles.userButton}
                >
                  <div className={styles.userAvatar}>
                    {user?.avatar ? (
                      <Image 
                        src={user.avatar} 
                        alt={user?.name || 'User avatar'} 
                        width={40} 
                        height={40}
                        className={styles.avatarImage}
                      />
                    ) : (
                      <span className={styles.userInitials}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <span className={styles.userName}>
                    {user?.name || 'User'}
                  </span>
                </button>

                <div className={`${styles.userDropdown} ${showMenu ? styles.active : ''}`}>
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>{user?.name}</p>
                    <p className={styles.userEmail}>{user?.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className={styles.userDropdownLink}
                    onClick={() => setShowMenu(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className={styles.userDropdownLink}
                    onClick={() => setShowMenu(false)}
                  >
                    Dashboard
                  </Link>
                  {user?.role === 'EDUCATOR' && (
                    <Link
                      href="/admin/subscriptions"
                      className={styles.userDropdownLink}
                      onClick={() => setShowMenu(false)}
                    >
                      Subscription Management
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleLogout();
                    }}
                    className={styles.logoutButton}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.authLinks}>
                <Link href="/login" className={styles.navLink}>
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className={styles.signupButton}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.backdrop} onClick={() => setMobileMenuOpen(false)}></div>
          <div className={styles.mobileMenuContent}>
            <div className={styles.mobileMenuHeader}>
              <Link href="/" className={styles.logoLink} onClick={() => setMobileMenuOpen(false)}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={styles.logoIcon}
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <span className={styles.logoText}>LearnMore</span>
              </Link>
              <button 
                className={styles.closeButton} 
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  className={styles.closeIcon}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={styles.mobileMenuLinks}>
              {isAuthenticated && (
                <div className={styles.mobileUserInfo}>
                  <div className={styles.userAvatar}>
                    {user?.avatar ? (
                      <Image 
                        src={user.avatar} 
                        alt={user?.name || 'User avatar'} 
                        width={40} 
                        height={40}
                        className={styles.avatarImage}
                      />
                    ) : (
                      <span className={styles.userInitials}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className={styles.userName}>{user?.name}</p>
                    <p className={styles.userEmail}>{user?.email}</p>
                  </div>
                </div>
              )}
              
              <nav className={styles.navLinks}>
                {navItems.map((item) => (
                  <Link 
                    key={item.name} 
                    href={item.href} 
                    className={`${styles.mobileNavLink} ${
                      pathname === item.href ? styles.activeMobileNavLink : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              
              {isAuthenticated ? (
                <div className={styles.mobileUserMenu}>
                  <Link
                    href="/profile"
                    className={styles.mobileNavLink}
                  >
                    Profile
                  </Link>
                  {user?.role === 'EDUCATOR' && (
                    <Link
                      href="/admin/subscriptions"
                      className={styles.mobileNavLink}
                    >
                      Subscription Management
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className={styles.mobileLogoutButton}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className={styles.mobileAuthLinks}>
                  <Link 
                    href="/login" 
                    className={styles.mobileAuthLink}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup" 
                    className={styles.mobileSignupButton}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 