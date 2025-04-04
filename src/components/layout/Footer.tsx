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
              创建、分享和跟踪在线课程的简单方式
            </p>
          </div>

          <div className={styles.column}>
            <h3 className={styles.heading}>产品</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/features" className={styles.link}>
                  功能
                </Link>
              </li>
              <li>
                <Link href="/pricing" className={styles.link}>
                  价格
                </Link>
              </li>
              <li>
                <Link href="/examples" className={styles.link}>
                  示例
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.heading}>支持</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/faq" className={styles.link}>
                  常见问题
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.link}>
                  联系我们
                </Link>
              </li>
              <li>
                <Link href="/help" className={styles.link}>
                  帮助中心
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.heading}>公司</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/about" className={styles.link}>
                  关于我们
                </Link>
              </li>
              <li>
                <Link href="/blog" className={styles.link}>
                  博客
                </Link>
              </li>
              <li>
                <Link href="/terms" className={styles.link}>
                  服务条款
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={styles.link}>
                  隐私政策
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.copyright}>
          <p>
            &copy; {new Date().getFullYear()} LearnMore. 保留所有权利。
          </p>
        </div>
      </div>
    </footer>
  );
} 