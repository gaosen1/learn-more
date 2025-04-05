'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import styles from './CodeExecution.module.css';

// 定义Pyodide类型
declare global {
  interface Window {
    pyodide: any;
    loadPyodide: (options: any) => Promise<any>;
  }
}

interface CodeExecutionProps {
  code: string;
  testCases?: Array<{
    input?: string;
    expectedOutput: string;
    description: string;
  }>;
  autoGrade?: boolean;
}

const CodeExecution: React.FC<CodeExecutionProps> = ({
  code,
  testCases = [],
  autoGrade = false,
}) => {
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [pyodideReady, setPyodideReady] = useState<boolean>(false);
  const [pyodideLoading, setPyodideLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Array<{
    passed: boolean;
    output: string;
    expectedOutput: string;
    description: string;
  }>>([]);

  // 加载Pyodide
  useEffect(() => {
    if (!window.pyodide && !pyodideLoading) {
      const loadPyodideEnvironment = async () => {
        try {
          setPyodideLoading(true);
          // 动态加载Pyodide脚本
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
          script.async = true;
          script.onload = async () => {
            try {
              window.pyodide = await window.loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
              });
              setPyodideReady(true);
            } catch (err) {
              console.error('Pyodide加载失败:', err);
              setError('无法加载Python执行环境，请刷新页面重试。');
            } finally {
              setPyodideLoading(false);
            }
          };
          script.onerror = () => {
            setError('加载Python环境失败，请检查您的网络连接并刷新页面。');
            setPyodideLoading(false);
          };
          document.body.appendChild(script);
        } catch (err) {
          console.error('加载Pyodide失败:', err);
          setError('初始化Python环境时发生错误。');
          setPyodideLoading(false);
        }
      };

      loadPyodideEnvironment();
    }
  }, [pyodideLoading]);

  // 执行代码
  const runCode = async () => {
    if (!pyodideReady) {
      setError('Python环境尚未加载完成，请稍候。');
      return;
    }

    setLoading(true);
    setOutput('');
    setError(null);
    setTestResults([]);

    try {
      // 捕获标准输出和错误
      const stdout: string[] = [];
      const stderr: string[] = [];

      window.pyodide.setStdout({ write: (text: string) => stdout.push(text) });
      window.pyodide.setStderr({ write: (text: string) => stderr.push(text) });

      // 执行代码
      await window.pyodide.runPythonAsync(code);

      const output = stdout.join('');
      setOutput(output);

      if (stderr.length > 0) {
        setError(stderr.join(''));
      }

      // 如果有测试用例且启用了自动评分，则运行测试
      if (autoGrade && testCases.length > 0) {
        runTests();
      }
    } catch (err: any) {
      setError(err.message || '执行代码时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 运行测试用例
  const runTests = async () => {
    if (!pyodideReady || !window.pyodide) {
      setError('Python环境尚未加载完成，请稍候。');
      return;
    }

    try {
      const results = await Promise.all(
        testCases.map(async (testCase) => {
          const stdout: string[] = [];
          window.pyodide.setStdout({ write: (text: string) => stdout.push(text) });

          try {
            // 如果有输入，设置标准输入
            if (testCase.input) {
              // 这里简化处理，实际上需要更复杂的输入处理逻辑
              await window.pyodide.runPythonAsync(`
                import sys
                import io
                sys.stdin = io.StringIO("""${testCase.input}""")
              `);
            }

            // 执行代码
            await window.pyodide.runPythonAsync(code);
            const output = stdout.join('').trim();
            
            return {
              passed: output === testCase.expectedOutput.trim(),
              output,
              expectedOutput: testCase.expectedOutput,
              description: testCase.description,
            };
          } catch (err: any) {
            return {
              passed: false,
              output: err.message || '执行测试时发生错误',
              expectedOutput: testCase.expectedOutput,
              description: testCase.description,
            };
          }
        })
      );

      setTestResults(results);
    } catch (err: any) {
      setError(err.message || '运行测试用例时发生错误');
    }
  };

  return (
    <div className={styles.executionContainer}>
      <div className={styles.controlPanel}>
        <Button 
          onClick={runCode} 
          disabled={loading || !pyodideReady || pyodideLoading}
          className={styles.runButton}
        >
          {loading ? <Spinner className="mr-2" size="sm" /> : null}
          {loading ? '正在执行...' : '运行代码'}
        </Button>
        
        {autoGrade && testCases.length > 0 && (
          <Button 
            onClick={runTests} 
            disabled={loading || !pyodideReady || pyodideLoading}
            variant="outline"
            className={styles.testButton}
          >
            运行测试
          </Button>
        )}
      </div>

      {pyodideLoading && (
        <div className={styles.loadingState}>
          <Spinner size="md" />
          <p>正在加载Python执行环境...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className={styles.errorOutput}>
          <AlertDescription>
            <pre>{error}</pre>
          </AlertDescription>
        </Alert>
      )}

      {output && (
        <div className={styles.outputContainer}>
          <h3 className={styles.outputTitle}>输出结果:</h3>
          <pre className={styles.output}>{output}</pre>
        </div>
      )}

      {testResults.length > 0 && (
        <div className={styles.testResultsContainer}>
          <h3 className={styles.testResultsTitle}>
            测试结果 ({testResults.filter(r => r.passed).length}/{testResults.length} 通过)
          </h3>
          <div className={styles.testResultsList}>
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`${styles.testResult} ${result.passed ? styles.passed : styles.failed}`}
              >
                <div className={styles.testHeader}>
                  <span className={styles.testIcon}>
                    {result.passed ? '✓' : '✗'}
                  </span>
                  <h4 className={styles.testDescription}>
                    测试 {index + 1}: {result.description}
                  </h4>
                </div>
                
                {!result.passed && (
                  <div className={styles.testDetails}>
                    <div className={styles.testOutputRow}>
                      <span className={styles.testLabel}>期望输出:</span>
                      <pre className={styles.testExpected}>{result.expectedOutput}</pre>
                    </div>
                    <div className={styles.testOutputRow}>
                      <span className={styles.testLabel}>实际输出:</span>
                      <pre className={styles.testActual}>{result.output}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeExecution; 