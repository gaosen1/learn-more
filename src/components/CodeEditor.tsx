'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import MonacoEditor from '@monaco-editor/react';
import styles from './CodeEditor.module.css';

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  theme?: string;
  height?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '',
  language = 'python',
  theme: propTheme,
  height = '400px',
  onChange,
  readOnly = false,
}) => {
  const [code, setCode] = useState(initialCode);
  const { resolvedTheme } = useTheme();
  const [editorTheme, setEditorTheme] = useState('light');

  useEffect(() => {
    // 根据系统主题设置编辑器主题
    setEditorTheme(resolvedTheme === 'dark' ? 'vs-dark' : 'light');
  }, [resolvedTheme]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      onChange && onChange(value);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    // 编辑器挂载后可以进行一些配置
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      readOnly: readOnly,
    });
  };

  return (
    <div className={styles.editorContainer} style={{ height }}>
      <MonacoEditor
        height={height}
        language={language}
        value={code}
        theme={propTheme || editorTheme}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          readOnly: readOnly,
        }}
      />
    </div>
  );
};

export default CodeEditor; 