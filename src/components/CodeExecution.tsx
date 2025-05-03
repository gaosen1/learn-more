'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import styles from './CodeExecution.module.css';

// Define Pyodide type
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

// Helper type for execution result
type ExecutionResult = {
  output: string;
  error: string | null;
};

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
    error?: string | null; // Add error field to test results
  }>>([]);

  // Load Pyodide from CDN
  useEffect(() => {
    if (!window.pyodide && !pyodideLoading) {
      const loadPyodideEnvironment = async () => {
        try {
          setPyodideLoading(true);
          console.log("[Pyodide Loader] Starting load from CDN...");
          const cdnUrl = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js";
          const indexUrl = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/";

          // Create script tag to load from CDN
          const script = document.createElement('script');
          script.src = cdnUrl;
          script.async = true;
          script.onload = async () => {
            console.log("[Pyodide Loader] Script loaded from CDN.");
            try {
              console.log("[Pyodide Loader] Calling window.loadPyodide()...");
              // Pass indexURL when loading from CDN
              window.pyodide = await window.loadPyodide({ indexURL: indexUrl }); 
              console.log("[Pyodide Loader] Pyodide loaded and initialized successfully from CDN.");
              setPyodideReady(true);
            } catch (loadErr) {
              console.error('[Pyodide Loader] Error during window.loadPyodide() from CDN:', loadErr);
              setError(`Failed to initialize Python runtime from CDN: ${loadErr instanceof Error ? loadErr.message : String(loadErr)}. Check console/network tab.`);
            } finally {
              setPyodideLoading(false);
              console.log("[Pyodide Loader] CDN load process finished.");
            }
          };
          script.onerror = (event: Event | string) => {
            console.error('[Pyodide Loader] Failed to load script from CDN. Event:', event);
            let errorDetails = 'Check network connection or browser console (F12) for more details.';
            if (event instanceof Event && event.target instanceof HTMLScriptElement) {
              errorDetails = `Failed to load script: ${event.target.src}. ${errorDetails}`;
            }
            setError(`Failed to load Python script from CDN. ${errorDetails} Please refresh.`);
            setPyodideLoading(false);
          };
          document.body.appendChild(script);
        } catch (initErr) {
          console.error('[Pyodide Loader] Error setting up CDN script loading:', initErr);
          setError(`Error initializing Python environment loading from CDN: ${initErr instanceof Error ? initErr.message : String(initErr)}`);
          setPyodideLoading(false);
        }
      };

      loadPyodideEnvironment();
    }
  }, [pyodideLoading]);

  // Helper function to execute Python code with proper I/O handling
  const executePython = async (pythonCode: string, input?: string): Promise<ExecutionResult> => {
    if (!pyodideReady || !window.pyodide) {
      throw new Error('Python environment is not ready yet.');
    }

    let stdout: string[] = [];
    let stderr: string[] = [];
    let inputBuffer = input ? input.split('\\n') : []; // Keep this for potential future use or remove if definitely not needed
    let inputIndex = 0; // Keep this for potential future use or remove if definitely not needed

    // Remove the stdin function
    /*
    const stdin = () => {
      if (inputIndex < inputBuffer.length) {
        const line = inputBuffer[inputIndex];
        inputIndex++;
        return line;
      }
      return null;
    };
    */

    try {
      // Prepare the full Python code to execute
      let fullCode = pythonCode;
      // Always prepend stdin setup, even if input is empty/null/undefined
      // Use empty string '' for StringIO if input is not provided
      const setupInput = input || ''; 
      // Escape triple quotes and backslashes within the input string
      const escapedInput = setupInput
          .replace(/\\/g, '\\\\') // Escape backslashes first
          .replace(/"""/g, '\\"\\"\\"'); // Escape triple quotes

      // Use triple quotes for the StringIO content to handle multi-line input naturally
      const setupCode = `
import sys
import io
sys.stdin = io.StringIO("""${escapedInput}""")
`;
      fullCode = setupCode + '\n' + pythonCode; // Prepend setup code
      

      // --- DEBUG LOG --- Print code and input
      console.log("[executePython] Executing code:\n", fullCode);
      console.log("[executePython] With setup input:", setupInput); // Log the input used for setup
      // ---------------

      // Configure I/O using 'batched' (reverting change)
      window.pyodide.setStdout({ batched: (text: string) => stdout.push(text) });
      window.pyodide.setStderr({ batched: (text: string) => stderr.push(text) });

      // Execute the potentially combined code without the stdin option
      await window.pyodide.runPythonAsync(fullCode);

      // --- DEBUG LOG --- Print captured streams
      console.log("[executePython] Raw stdout captured:", stdout);
      console.log("[executePython] Raw stderr captured:", stderr);
      // ---------------

      return {
        output: stdout.join('').trim(), // Trim trailing newline often added by print
        error: stderr.length > 0 ? stderr.join('') : null,
      };
    } catch (err: any) {
        // --- DEBUG LOG --- Print caught error
        console.error("[executePython] Error caught during execution:", err);
        // ---------------

        // Capture execution errors (like syntax errors, runtime errors caught by Python)
        // These might also appear in stderr, but this catches errors during execution itself.
        stderr.push(String(err)); // Add execution error to stderr
        return {
            output: stdout.join('').trim(),
            error: stderr.join(''),
        };
    }
  };


  // Execute code for the "Run Code" button
  const runCode = async () => {
    setLoading(true);
    setOutput('');
    setError(null);
    setTestResults([]);

    try {
      const result = await executePython(code); // No input provided for general run
      setOutput(result.output);
      if (result.error) {
        setError(result.error);
      }

      // Remove the automatic triggering of runTests after runCode
      /*
      if (autoGrade && testCases.length > 0) {
         await runTests(false); 
      }
      */

    } catch (err: any) {
      setError(err.message || 'Error executing code');
    } finally {
      setLoading(false);
    }
  };

  // Run test cases for the "Run Tests" button or after "Run Code" if autoGrade=true
  const runTests = async (isPrimaryAction: boolean = true) => {
    if (isPrimaryAction) {
        setLoading(true); // Only set loading if "Run Tests" button was clicked
        setError(null);
        setOutput(''); // Clear general output when running tests specifically
    }
    setTestResults([]); // Clear previous results

    if (!pyodideReady || !window.pyodide) {
      setError('Python environment is not ready yet. Please wait.');
      if (isPrimaryAction) setLoading(false);
      return;
    }

    try {
        const resultsPromises = testCases.map(async (testCase) => {
            const result = await executePython(code, testCase.input);
            const passed = !result.error && result.output.trim() === testCase.expectedOutput.trim();
            return {
              passed: passed,
              output: result.output,
              expectedOutput: testCase.expectedOutput,
              description: testCase.description,
              error: result.error, // Include error output in the result object
            };
        });

        const results = await Promise.all(resultsPromises);
        setTestResults(results);

    } catch (err: any) {
      setError(err.message || 'Error running test cases');
    } finally {
       if (isPrimaryAction) setLoading(false);
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
            onClick={() => runTests(true)} // Ensure this passes true
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
          <p>Loading Python Runtime Environment... (this may take a moment)</p>
        </div>
      )}

      {/* Display general error (e.g., Pyodide loading error, test runner error) */}
      {error && !testResults.length && ( // Only show general error if no test results are shown
        <Alert variant="destructive" className={styles.errorOutput}>
          <AlertDescription>
            <pre>{error}</pre>
          </AlertDescription>
        </Alert>
      )}

      {/* Display general output only if tests were not the primary action */}
       {output && !testResults.length && ( // Only show general output if no test results are shown
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
                <div className={styles.testDetails}>
                  <div>
                    <strong>Actual Output:</strong>
                    <pre>{result.output !== '' ? result.output : '(No output)'}</pre>
                  </div>
                  {!result.passed && (
                    <>
                      <div>
                        <strong>Expected Output:</strong>
                        <pre>{result.expectedOutput}</pre>
                      </div>
                      {result.error && (
                        <div>
                          <strong>Error:</strong>
                          <pre>{result.error}</pre>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeExecution; 