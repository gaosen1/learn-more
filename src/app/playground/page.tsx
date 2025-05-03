'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CodeEditor from '@/components/CodeEditor';
import CodeExecution from '@/components/CodeExecution';
import styles from './page.module.css'; // Create this CSS module file later

// Sample test cases for demonstration
const sampleTestCases = [
  {
    input: '5\n3', // Simulate user input newline separated
    expectedOutput: '8',
    description: 'Test with input 5 and 3, expected output 8'
  },
  {
    input: '', // No input
    expectedOutput: 'Hello World',
    description: 'Test with no input, expected output "Hello World"'
  },
  {
    input: '10\n-2', 
    expectedOutput: '8',
    description: 'Test with input 10 and -2, expected output 8'
  },
   {
    input: 'invalid input', 
    expectedOutput: 'Error handling? Or specific output?',
    description: 'Test with potentially invalid input' // Example of a failing case
  }
];

// Initial code example
const initialCode = `# Example Python code to sum two numbers from input
try:
    num1_str = input("Enter first number: ")
    num2_str = input("Enter second number: ")
    num1 = int(num1_str)
    num2 = int(num2_str)
    print(num1 + num2)
except ValueError:
    print("Invalid input. Please enter numbers.")
except EOFError: # Handle cases where input is expected but not provided fully
    print("Input stream ended unexpectedly.")

# print("Hello World") # Uncomment for the second test case
`;

export default function PlaygroundPage() {
  const [code, setCode] = useState<string>(initialCode);

  const handleCodeChange = (value: string) => {
    console.log("[PlaygroundPage] handleCodeChange called with value:", value);
    setCode(value);
  };

  return (
    <MainLayout>
      <div className={styles.playgroundContainer}>
        <h1 className={styles.title}>Coding Playground</h1>
        <p className={styles.description}>
          Experiment with Python code directly in your browser. Use the editor below and click "Run Code" or "Run Tests".
        </p>

        <div className={styles.editorWrapper}>
          <CodeEditor 
            initialCode={code}
            language="python"
            onChange={handleCodeChange}
            height="450px" // Adjust height as needed
          />
        </div>

        <div className={styles.executionWrapper}>
          <CodeExecution 
            code={code}
            testCases={sampleTestCases}
            autoGrade={true} // Enable test cases panel
          />
        </div>
      </div>
    </MainLayout>
  );
} 