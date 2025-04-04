'use client';

import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import styles from './page.module.css';

// Feature data
const features = [
  {
    id: 'intuitive-course-building',
    title: 'Intuitive Course Building',
    description: 'Create well-structured courses with our easy-to-use editor. Add lessons, text, images, and more without any technical knowledge.',
    iconLetter: 'I'
  },
  {
    id: 'qr-code-sharing',
    title: 'QR Code Sharing',
    description: 'Share your courses instantly with a unique QR code. Perfect for in-person events, printed materials, or quick digital sharing.',
    iconLetter: 'Q'
  },
  {
    id: 'progress-tracking',
    title: 'Progress Tracking',
    description: 'Monitor student progress through comprehensive analytics. See completion rates, time spent, and identify areas for improvement.',
    iconLetter: 'P'
  },
  {
    id: 'mobile-friendly',
    title: 'Mobile-Friendly Learning',
    description: 'Access courses from any device. Our responsive design ensures a seamless learning experience on desktops, tablets, and smartphones.',
    iconLetter: 'M'
  },
  {
    id: 'notifications',
    title: 'Smart Notifications',
    description: 'Keep learners engaged with timely reminders and updates. Notifications can be customized to match your engagement strategy.',
    iconLetter: 'N'
  },
  {
    id: 'certificates',
    title: 'Course Certificates',
    description: 'Reward completion with customizable certificates. Add your branding and design to create professional recognition for your students.',
    iconLetter: 'C'
  }
];

export default function FeaturesPage() {
  return (
    <MainLayout>
      <div className={styles.featuresPage}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>Platform Features</h1>
            <p className={styles.subtitle}>
              Discover the tools and features that make LearnMore the perfect platform for creating and sharing online courses.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature) => (
              <div key={feature.id} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <div className={styles.iconFallback}>
                    {feature.iconLetter}
                  </div>
                </div>
                <h2 className={styles.featureTitle}>{feature.title}</h2>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>

          <div className={styles.ctaSection}>
            <h2 className={styles.ctaTitle}>Ready to start creating courses?</h2>
            <p className={styles.ctaText}>
              Join thousands of instructors who are already using LearnMore to share their knowledge with the world.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/signup">
                <button className={styles.primaryButton}>Get Started for Free</button>
              </Link>
              <Link href="/pricing">
                <button className={styles.secondaryButton}>View Pricing Plans</button>
              </Link>
            </div>
          </div>

          <div className={styles.testimonialsSection}>
            <h2 className={styles.sectionTitle}>What Our Users Say</h2>
            <div className={styles.testimonials}>
              <div className={styles.testimonialCard}>
                <p className={styles.testimonialText}>
                  "LearnMore has transformed how I create and share my programming tutorials. The intuitive interface and progress tracking features have helped me increase student engagement by 40%."
                </p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorImage}>
                    <div className={styles.authorInitials}>JS</div>
                  </div>
                  <div className={styles.authorInfo}>
                    <p className={styles.authorName}>James Smith</p>
                    <p className={styles.authorTitle}>Software Development Instructor</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.testimonialCard}>
                <p className={styles.testimonialText}>
                  "As a digital marketing consultant, I needed a simple way to deliver training to my clients. LearnMore's QR code sharing and mobile-friendly design have made this process seamless."
                </p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorImage}>
                    <div className={styles.authorInitials}>AL</div>
                  </div>
                  <div className={styles.authorInfo}>
                    <p className={styles.authorName}>Amy Lee</p>
                    <p className={styles.authorTitle}>Digital Marketing Consultant</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.testimonialCard}>
                <p className={styles.testimonialText}>
                  "The certificate feature has been a game-changer for my corporate training programs. My clients love having professional documentation of their completed courses."
                </p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorImage}>
                    <div className={styles.authorInitials}>RJ</div>
                  </div>
                  <div className={styles.authorInfo}>
                    <p className={styles.authorName}>Robert Johnson</p>
                    <p className={styles.authorTitle}>Corporate Training Specialist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.faqSection}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>Is LearnMore suitable for beginners with no course creation experience?</h3>
                <p className={styles.faqAnswer}>
                  Absolutely! LearnMore is designed with simplicity in mind. Our intuitive interface makes it easy for anyone to create professional-looking courses, regardless of technical experience.
                </p>
              </div>
              
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>Can I integrate LearnMore with my existing website or LMS?</h3>
                <p className={styles.faqAnswer}>
                  Yes, LearnMore offers various integration options through our API. You can embed courses directly on your website or connect with popular learning management systems.
                </p>
              </div>
              
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>How do students access the courses I create?</h3>
                <p className={styles.faqAnswer}>
                  Students can access your courses through direct links, QR codes, or by logging into the LearnMore platform if you've set up user accounts for them.
                </p>
              </div>
              
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>What types of content can I include in my courses?</h3>
                <p className={styles.faqAnswer}>
                  LearnMore supports a wide range of content types including text, images, videos, documents, quizzes, interactive elements, and more. This flexibility allows you to create engaging learning experiences.
                </p>
              </div>
            </div>
            
            <div className={styles.moreFaqLink}>
              <Link href="/faq">
                View all frequently asked questions →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 