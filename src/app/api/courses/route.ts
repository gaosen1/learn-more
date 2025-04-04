import { NextResponse } from 'next/server';

// Sample course data
export const courses = [
  {
    id: '1',
    title: 'Web Development Basics',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript',
    imageUrl: '/course-images/web-dev.jpg',
    progress: 75,
    lessons: [
      { id: '1-1', title: 'Introduction to HTML', completed: true },
      { id: '1-2', title: 'HTML Elements and Structure', completed: true },
      { id: '1-3', title: 'CSS Fundamentals', completed: true },
      { id: '1-4', title: 'CSS Layout Models', completed: true },
      { id: '1-5', title: 'JavaScript Basics', completed: true },
      { id: '1-6', title: 'DOM Manipulation', completed: true },
      { id: '1-7', title: 'JavaScript Events', completed: true },
      { id: '1-8', title: 'Forms and Validation', completed: true },
      { id: '1-9', title: 'Making API Requests', completed: false },
      { id: '1-10', title: 'Building a Simple Web App', completed: false },
      { id: '1-11', title: 'Web Accessibility Basics', completed: false },
      { id: '1-12', title: 'Project: Portfolio Website', completed: false }
    ],
    completedLessons: 8,
    category: 'programming',
    author: 'John Smith',
    createdAt: '2023-05-15',
    updatedAt: '2023-09-20',
    isPublic: true
  },
  {
    id: '2',
    title: 'Python Programming for Beginners',
    description: 'Start learning Python programming from scratch',
    imageUrl: '/course-images/python.jpg',
    progress: 40,
    lessons: [
      { id: '2-1', title: 'Getting Started with Python', completed: true },
      { id: '2-2', title: 'Python Syntax Basics', completed: true },
      { id: '2-3', title: 'Variables and Data Types', completed: true },
      { id: '2-4', title: 'Control Flow: Conditionals', completed: true },
      { id: '2-5', title: 'Control Flow: Loops', completed: false },
      { id: '2-6', title: 'Functions in Python', completed: false },
      { id: '2-7', title: 'Working with Lists and Dictionaries', completed: false },
      { id: '2-8', title: 'File Handling', completed: false },
      { id: '2-9', title: 'Error Handling', completed: false },
      { id: '2-10', title: 'Project: Simple Command Line App', completed: false }
    ],
    completedLessons: 4,
    category: 'programming',
    author: 'Sarah Johnson',
    createdAt: '2023-06-10',
    updatedAt: '2023-10-05',
    isPublic: true
  },
  {
    id: '3',
    title: 'Data Structures and Algorithms',
    description: 'Understand and implement common data structures and algorithms',
    imageUrl: '/course-images/dsa.jpg',
    progress: 10,
    lessons: [
      { id: '3-1', title: 'Introduction to Algorithm Analysis', completed: true },
      { id: '3-2', title: 'Arrays and Linked Lists', completed: false },
      { id: '3-3', title: 'Stacks and Queues', completed: false },
      { id: '3-4', title: 'Trees and Binary Search Trees', completed: false },
      { id: '3-5', title: 'Heaps and Priority Queues', completed: false },
      { id: '3-6', title: 'Hash Tables', completed: false },
      { id: '3-7', title: 'Graphs and Graph Algorithms', completed: false },
      { id: '3-8', title: 'Searching Algorithms', completed: false },
      { id: '3-9', title: 'Sorting Algorithms', completed: false },
      { id: '3-10', title: 'Dynamic Programming', completed: false },
      { id: '3-11', title: 'Greedy Algorithms', completed: false },
      { id: '3-12', title: 'Advanced Topics', completed: false },
      { id: '3-13', title: 'Practical Algorithm Applications', completed: false },
      { id: '3-14', title: 'Algorithm Interview Questions', completed: false },
      { id: '3-15', title: 'Final Project: Algorithm Implementation', completed: false }
    ],
    completedLessons: 1,
    category: 'programming',
    author: 'Michael Chen',
    createdAt: '2023-07-12',
    updatedAt: '2023-11-01',
    isPublic: true
  }
];

export async function GET() {
  return NextResponse.json(courses);
} 