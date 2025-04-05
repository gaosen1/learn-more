'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeEditor from '@/components/CodeEditor';
import CodeExecution from '@/components/CodeExecution';
import styles from './code-playground.module.css';

const defaultPythonCode = `# Write your Python code here
print("Hello, world!")

# 尝试一个简单的函数
def 计算平方(数字):
    return 数字 * 数字

结果 = 计算平方(5)
print(f"5的平方是: {结果}")
`;

const sampleTestCases = [
  {
    description: '打印"你好，世界！"',
    expectedOutput: '你好，世界！\n5的平方是: 25',
    input: ''
  },
  {
    description: '计算10的平方',
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
      <h1 className={styles.title}>Python代码练习场</h1>
      <p className={styles.description}>
        在这里你可以编写、测试和运行Python代码，无需安装任何环境。
      </p>
      
      <div className={styles.playgroundContainer}>
        <Tabs defaultValue="python" className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="javascript" disabled>JavaScript (即将推出)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="python" className={styles.tabContent}>
            <Card>
              <CardHeader>
                <CardTitle>Python编辑器</CardTitle>
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
        <h2>如何使用</h2>
        <ul>
          <li>在编辑器中编写你的Python代码</li>
          <li>点击"运行代码"按钮执行代码</li>
          <li>查看输出结果</li>
          <li>使用"运行测试"查看代码是否符合预期</li>
        </ul>
        
        <h2>使用Pyodide</h2>
        <p>
          本代码练习场使用<a href="https://pyodide.org/" target="_blank" rel="noopener noreferrer">Pyodide</a>，
          它是Python的WebAssembly版本，可以在浏览器中直接运行Python代码。
        </p>
        
        <h2>限制</h2>
        <p>
          由于是在浏览器环境中运行，部分Python库可能不可用或表现不同。
          代码执行时间和内存也有限制，复杂计算可能会导致浏览器变慢。
        </p>
      </div>
    </div>
  );
};

export default CodePlaygroundPage;