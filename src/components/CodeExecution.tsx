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
              console.error('Failed to load Pyodide:', err);
              setError('Failed to load Python runtime. Please refresh the page and try again.');
            } finally {
              setPyodideLoading(false);
            }
          };
          script.onerror = () => {
            setError('Failed to load Python environment. Please check your network connection and refresh the page.');
            setPyodideLoading(false);
          };
          document.body.appendChild(script);
        } catch (err) {
          console.error('Failed to load Pyodide:', err);
          setError('Error initializing Python environment.');
          setPyodideLoading(false);
        }
      };

      loadPyodideEnvironment();
    }
  }, [pyodideLoading]);

  // Execute code
  const runCode = async () => {
    if (!pyodideReady) {
      setError('Python environment is not ready yet. Please wait.');
      return;
    }

    setLoading(true);
    setOutput('');
    setError(null);
    setTestResults([]);

    try {
      // Capture stdout and stderr
      const stdout: string[] = [];
      const stderr: string[] = [];

      window.pyodide.setStdout({ write: (text: string) => stdout.push(text) });
      window.pyodide.setStderr({ write: (text: string) => stderr.push(text) });

      // Execute code
      await window.pyodide.runPythonAsync(code);

      const output = stdout.join('');
      setOutput(output);

      if (stderr.length > 0) {
        setError(stderr.join(''));
      }

      // Run tests if there are test cases and auto-grading is enabled
      if (autoGrade && testCases.length > 0) {
        runTests();
      }
    } catch (err: any) {
      setError(err.message || 'Error executing code');
    } finally {
      setLoading(false);
    }
  };

  // Run test cases
  const runTests = async () => {
    if (!pyodideReady || !window.pyodide) {
      setError('Python environment is not ready yet. Please wait.');
      return;
    }

    try {
      const results = await Promise.all(
        testCases.map(async (testCase) => {
          const stdout: string[] = [];
          window.pyodide.setStdout({ write: (text: string) => stdout.push(text) });

          try {
            // Set stdin if input exists
            if (testCase.input) {
              // Simplified input handling, actual implementation needs more complex logic
              await window.pyodide.runPythonAsync(`
                import sys
                import io
                sys.stdin = io.StringIO("""${testCase.input}""")
              `);
            }

            // Execute code
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
              output: err.message || 'Error executing test',
              expectedOutput: testCase.expectedOutput,
              description: testCase.description,
            };
          }
        })
      );

      setTestResults(results);
    } catch (err: any) {
      setError(err.message || 'Error running test cases');
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
          {loading ? 'Executing...' : 'Run Code'}
        </Button>
        
        {autoGrade && testCases.length > 0 && (
          <Button 
            onClick={runTests} 
            disabled={loading || !pyodideReady || pyodideLoading}
            variant="outline"
            className={styles.testButton}
          >
            Run Tests
          </Button>
        )}
      </div>

      {pyodideLoading && (
        <div className={styles.loadingState}>
          <Spinner size="md" />
          <p>Loading Python runtime environment...</p>
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
          <h3 className={styles.outputTitle}>Output:</h3>
          <pre className={styles.output}>{output}</pre>
        </div>
      )}

      {testResults.length > 0 && (
        <div className={styles.testResultsContainer}>
          <h3 className={styles.testResultsTitle}>
            Test Results ({testResults.filter(r => r.passed).length}/{testResults.length} Passed)
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
                    Test {index + 1}: {result.description}
                  </h4>
                </div>
                
                {!result.passed && (
                  <div className={styles.testDetails}>
                    <div className={styles.testOutputRow}>
                      <span className={styles.testLabel}>Expected Output:</span>
                      <pre className={styles.testExpected}>{result.expectedOutput}</pre>
                    </div>
                    <div className={styles.testOutputRow}>
                      <span className={styles.testLabel}>Actual Output:</span>
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