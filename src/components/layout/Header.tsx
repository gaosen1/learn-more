'use client';

import { useState, useEffect, useRef } from 'react';
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

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 在客户端检查用户登录状态
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    
    if (userToken) {
      setIsLoggedIn(true);
      fetchUserData(userToken);
    }
  }, []);

  // 添加点击外部关闭菜单的事件监听
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 获取用户数据
  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // 如果请求失败，可能是token无效
        localStorage.removeItem('userToken');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

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
    setUser(null);
    // 如果有需要，可以重定向到首页
    window.location.href = '/';
  }

  // 获取用户头像或显示用户首字母
  const renderUserAvatar = () => {
    if (user?.avatar) {
      return <img src={user.avatar} alt={user.name} className={styles.avatarImage} />;
    } else if (user?.name) {
      return <span className={styles.userInitials}>{user.name.charAt(0)}</span>;
    } else {
      return <span className={styles.userInitials}>U</span>;
    }
  };

  // 切换用户菜单的显示状态
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // 关闭用户菜单
  const closeUserMenu = () => {
    setUserMenuOpen(false);
  };

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
              <div className={styles.userMenu} ref={userMenuRef}>
                <div 
                  className={styles.userAvatar}
                  onClick={toggleUserMenu}
                >
                  {renderUserAvatar()}
                </div>
                {userMenuOpen && (
                  <div className={`${styles.userDropdown} ${styles.active}`}>
                    {user && (
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    )}
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={styles.userDropdownLink}
                        onClick={(e) => {
                          if (item.onClick) {
                            item.onClick(e);
                          }
                          closeUserMenu();
                        }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
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
                    {user && (
                      <div className={styles.mobileUserInfo}>
                        <div className={styles.userAvatar}>
                          {renderUserAvatar()}
                        </div>
                        <div>
                          <span className={styles.userName}>{user.name}</span>
                          <span className={styles.userEmail}>{user.email}</span>
                        </div>
                      </div>
                    )}
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