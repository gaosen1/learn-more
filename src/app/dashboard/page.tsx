import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import styles from "./page.module.css";

// 模拟课程数据
const courses = [
  {
    id: '1',
    title: '网页开发基础',
    description: '学习HTML、CSS和JavaScript的基础知识',
    progress: 75,
    lessons: 12,
    completedLessons: 9
  },
  {
    id: '2',
    title: 'Python编程入门',
    description: '从零开始学习Python编程语言',
    progress: 40,
    lessons: 10,
    completedLessons: 4
  },
  {
    id: '3',
    title: '数据结构与算法',
    description: '理解和实现常见的数据结构和算法',
    progress: 10,
    lessons: 15,
    completedLessons: 1
  }
];

export default function Dashboard() {
  return (
    <MainLayout>
      <div className={styles.dashboard}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>我的课程</h1>
            <Link href="/create" className="btn btn-primary">
              创建新课程
            </Link>
          </div>
          
          {courses.length > 0 ? (
            <div className={styles.courses}>
              {courses.map(course => (
                <div key={course.id} className={styles.courseCard}>
                  <div className={styles.courseHeader}>
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    <div className={styles.progress}>
                      <div 
                        className={styles.progressBar} 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className={styles.progressText}>
                      {course.progress}% 完成
                    </span>
                  </div>
                  <p className={styles.courseDescription}>{course.description}</p>
                  <div className={styles.courseMeta}>
                    <span>课时: {course.completedLessons}/{course.lessons}</span>
                  </div>
                  <div className={styles.courseActions}>
                    <Link href={`/course/${course.id}`} className="btn btn-primary">
                      继续学习
                    </Link>
                    <Link href={`/course/${course.id}/edit`} className="btn btn-outline">
                      编辑课程
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              </div>
              <h2 className={styles.emptyTitle}>还没有课程</h2>
              <p className={styles.emptyDescription}>创建您的第一个课程，开始分享知识！</p>
              <Link href="/create" className="btn btn-primary">
                创建课程
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 