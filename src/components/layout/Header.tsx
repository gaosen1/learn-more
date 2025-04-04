'use client';

import React, { useState } from 'react';
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

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export default function Header() {
  const { user, isAuthenticated, isLoading } = useUser();
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
      type: 'info'
    });
    router.push('/');
  };

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
            <nav className={styles.desktopNav}>
              {navigation.map((item) => (
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
              {isAuthenticated && (
                <>
                  
                  {user?.role === 'ADMIN' && (
                    <Link 
                      href="/create" 
                      className={`${styles.navLink} ${
                        pathname === '/create' ? styles.activeNavLink : ''
                      }`}
                    >
                      Create Course
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>

          <div className={styles.userSection}>
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
                  {user?.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className={styles.userDropdownLink}
                      onClick={() => setShowMenu(false)}
                    >
                      Admin Panel
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
    </header>
  );
} 