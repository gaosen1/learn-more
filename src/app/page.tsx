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
            <h1 className={styles.heroTitle}>Interactive Course Creation Platform</h1>
            <p className={styles.heroSubtitle}>
              Create, share, and track online courses with ease
            </p>
            <div className={styles.heroCta}>
              <Link href="/signup" className="btn btn-primary">
                Get Started
              </Link>
              <Link href="/features" className="btn btn-outline">
                Learn More
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <Image
              src="/hero-image.png"
              alt="LearnMore Platform Preview"
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
            <h2 className={styles.sectionTitle}>Core Features</h2>
            <p className={styles.sectionDescription}>
              LearnMore offers a variety of features to meet your teaching needs
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
              <h3 className={styles.featureTitle}>Course Creation & Management</h3>
              <p className={styles.featureDescription}>
                Intuitive course builder interface with multi-page structure support
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>QR Code Generation</h3>
              <p className={styles.featureDescription}>
                Generate printable QR codes to easily share your course content
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Assessment Tools</h3>
              <p className={styles.featureDescription}>
                Embed quizzes throughout your course and track performance analytics
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Programming Education</h3>
              <p className={styles.featureDescription}>
                Run Python and JavaScript code directly in the browser with gradable exercises
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cta}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Create Your First Course Today</h2>
            <p className={styles.ctaDescription}>
              Sign up for a free account and experience the power of LearnMore
            </p>
            <Link href="/signup" className="btn btn-primary">
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
