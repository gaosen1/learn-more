import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={styles.grid}>
          <div className={styles.column}>
            <h3 className={styles.heading}>LearnMore</h3>
            <p className={styles.description}>
              A simple way to create, share, and track online courses
            </p>
          </div>

          <div className={styles.column}>
            <h3 className={styles.heading}>Product</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/features" className={styles.link}>
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className={styles.link}>
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/examples" className={styles.link}>
                  Examples
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.heading}>Support</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/faq" className={styles.link}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.link}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/help" className={styles.link}>
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.heading}>Company</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/about" className={styles.link}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className={styles.link}>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/terms" className={styles.link}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={styles.link}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.copyright}>
          <p>
            &copy; {new Date().getFullYear()} LearnMore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 