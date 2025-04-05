'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeEditor from '@/components/CodeEditor';
import CodeExecution from '@/components/CodeExecution';
import styles from './code-playground.module.css';

const defaultPythonCode = `# Write your Python code here
print("Hello, world!")

# Try a simple function
def square(number):
    return number * number

result = square(5)
print(f"The square of 5 is: {result}")
`;

const sampleTestCases = [
  {
    description: 'Print "Hello, world!"',
    expectedOutput: 'Hello, world!\nThe square of 5 is: 25',
    input: ''
  },
  {
    description: 'Calculate square of 10',
    expectedOutput: '100',
    input: '10'
  }
];

const CodePlaygroundPage = () => {
  const [code, setCode] = useState(defaultPythonCode);
  
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Python Code Playground</h1>
      <p className={styles.description}>
        Here you can write, test and run Python code without installing any environment.
      </p>
      
      <div className={styles.playgroundContainer}>
        <Tabs defaultValue="python" className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="javascript" disabled>JavaScript (Coming Soon)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="python" className={styles.tabContent}>
            <Card>
              <CardHeader>
                <CardTitle>Python Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.editorContainer}>
                  <CodeEditor 
                    initialCode={code}
                    language="python"
                    height="300px"
                    onChange={handleCodeChange}
                  />
                </div>
                
                <div className={styles.executionContainer}>
                  <CodeExecution 
                    code={code}
                    testCases={sampleTestCases}
                    autoGrade={true}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className={styles.infoSection}>
        <h2>How to Use</h2>
        <ul>
          <li>Write your Python code in the editor</li>
          <li>Click "Run Code" button to execute the code</li>
          <li>Check the output results</li>
          <li>Use "Run Tests" to verify if your code meets expectations</li>
        </ul>
        
        <h2>Using Pyodide</h2>
        <p>
          This code playground uses <a href="https://pyodide.org/" target="_blank" rel="noopener noreferrer">Pyodide</a>,
          a WebAssembly version of Python that runs Python code directly in the browser.
        </p>
        
        <h2>Limitations</h2>
        <p>
          Due to the browser environment, some Python libraries may be unavailable or behave differently.
          Code execution time and memory are also limited, complex computations may slow down the browser.
        </p>
      </div>
    </div>
  );
};

export default CodePlaygroundPage;