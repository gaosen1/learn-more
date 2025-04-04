import Image from "next/image";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import styles from "./page.module.css";

export default function Home() {
  return (
    <MainLayout>
      <div className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>交互式课程创建平台</h1>
            <p className={styles.heroSubtitle}>
              轻松创建、分享和跟踪在线课程的简单方式
            </p>
            <div className={styles.heroCta}>
              <Link href="/signup" className="btn btn-primary">
                开始使用
              </Link>
              <Link href="/features" className="btn btn-outline">
                了解功能
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <Image
              src="/hero-image.png"
              alt="LearnMore 平台预览"
              width={600}
              height={400}
              className={styles.image}
              priority
            />
          </div>
        </div>
      </div>

      <div className={styles.features}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>核心功能</h2>
            <p className={styles.sectionDescription}>
              LearnMore 提供多种功能，满足各种教学需求
            </p>
          </div>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>课程创建与管理</h3>
              <p className={styles.featureDescription}>
                直观的课程构建界面，支持多页面课程结构和媒体集成
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>QR码生成</h3>
              <p className={styles.featureDescription}>
                生成打印QR码表格，轻松分享课程内容
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>评估工具</h3>
              <p className={styles.featureDescription}>
                在课程中嵌入各类测验问题，并跟踪表现分析
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>编程教育</h3>
              <p className={styles.featureDescription}>
                通过可评分的编程练习直接在浏览器中运行Python和JavaScript代码
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cta}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>开始创建您的第一个课程</h2>
            <p className={styles.ctaDescription}>
              注册免费账户，立即体验LearnMore的强大功能
            </p>
            <Link href="/signup" className="btn btn-primary">
              免费注册
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
