import MainLayout from "@/components/layout/MainLayout";
import styles from "./page.module.css";

export default function About() {
  return (
    <MainLayout>
      <div className={styles.about}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>About Us</h1>
            <p className={styles.subtitle}>
              LearnMore is a platform focused on simplifying online course creation
            </p>
          </div>

          <div className={styles.content}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Our Mission</h2>
              <p className={styles.paragraph}>
                LearnMore's mission is to make creating, sharing, and tracking online courses simple. We believe knowledge should be easily accessible, and our platform is designed to make the connection between educators and learners closer and more efficient.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Platform Features</h2>
              <div className={styles.featureList}>
                <div className={styles.feature}>
                  <h3 className={styles.featureTitle}>Intuitive Course Building</h3>
                  <p className={styles.featureDescription}>
                    We provide simple and easy-to-use tools that allow you to create structured multi-page course content.
                  </p>
                </div>
                <div className={styles.feature}>
                  <h3 className={styles.featureTitle}>QR Code Sharing</h3>
                  <p className={styles.featureDescription}>
                    Generate QR codes linking to your courses, making it easy for learners to access content in any environment.
                  </p>
                </div>
                <div className={styles.feature}>
                  <h3 className={styles.featureTitle}>Progress Tracking</h3>
                  <p className={styles.featureDescription}>
                    Detailed learner progress tracking and analysis tools to help you understand course effectiveness.
                  </p>
                </div>
                <div className={styles.feature}>
                  <h3 className={styles.featureTitle}>Programming Education</h3>
                  <p className={styles.featureDescription}>
                    Python and JavaScript exercises that run directly in the browser, perfect for programming courses.
                  </p>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Our Team</h2>
              <p className={styles.paragraph}>
                The LearnMore team consists of professionals passionate about education and technology. Our team members come from diverse backgrounds but share a common goal: to create the best online course platform.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Contact Us</h2>
              <p className={styles.paragraph}>
                If you have any questions, suggestions, or partnership inquiries, please feel free to contact us:
              </p>
              <p className={styles.contactInfo}>
                Email: contact@learnmore.com<br />
                Address: 123 Education Street, San Francisco, CA 94110
              </p>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 