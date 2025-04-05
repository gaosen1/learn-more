'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { LoadingDots } from '@/components/ui/loading';
import { getCurrentUser } from '@/utils/auth';
import styles from './page.module.css';

// Table selection component
function TableSelector({ onSelect, currentTable }: { onSelect: (table: string) => void; currentTable: string }) {
  const tables = ['User', 'Course', 'Lesson', 'UserCourse', 'Subscription', 'Exercise', 'Solution'];
  
  return (
    <div className={styles.tableSelector}>
      <h3>Database Tables</h3>
      <div className={styles.tableList}>
        {tables.map(table => (
          <button
            key={table}
            className={`${styles.tableButton} ${currentTable === table ? styles.active : ''}`}
            onClick={() => onSelect(table)}
          >
            {table}
          </button>
        ))}
      </div>
    </div>
  );
}

// Data table component
function DataTable({ data, table }: { data: any[]; table: string }) {
  if (!data || data.length === 0) {
    return <div className={styles.emptyState}>No data found for {table}</div>;
  }
  
  // Get headers from first row
  const headers = Object.keys(data[0]);
  
  return (
    <div className={styles.tableContainer}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            {headers.map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {headers.map(header => (
                <td key={`${index}-${header}`}>
                  {renderCell(row[header])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper function to render different types of cell data
function renderCell(value: any) {
  if (value === null || value === undefined) {
    return <span className={styles.nullValue}>NULL</span>;
  }
  
  if (typeof value === 'object') {
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    return <pre>{JSON.stringify(value, null, 2)}</pre>;
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  return String(value);
}

// Main DB Explorer component
function DBExplorer() {
  const router = useRouter();
  const [table, setTable] = useState('User');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState<any>({});
  const [page, setPage] = useState(1);
  const limit = 10;

  // Check if user is authorized
  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'EDUCATOR') {
      router.push('/login');
    }
  }, [router]);

  // Fetch data based on selected table
  const fetchData = async (tableName: string, pageNum: number) => {
    setLoading(true);
    setError('');
    
    try {
      const offset = (pageNum - 1) * limit;
      const response = await fetch(`/api/admin/db-explorer?table=${tableName}&limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result.data);
      setMeta(result.meta);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data');
      setLoading(false);
    }
  };

  // Handle table selection
  const handleTableSelect = (tableName: string) => {
    setTable(tableName);
    setPage(1);
    fetchData(tableName, 1);
  };

  // Load initial data
  useEffect(() => {
    fetchData(table, page);
  }, []);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > meta.pages) return;
    setPage(newPage);
    fetchData(table, newPage);
  };
  
  return (
    <div className={styles.dbExplorer}>
      <div className={styles.header}>
        <h1>Database Explorer</h1>
        <p>View and explore data in your production database</p>
      </div>
      
      <div className={styles.content}>
        <TableSelector onSelect={handleTableSelect} currentTable={table} />
        
        <div className={styles.dataView}>
          <div className={styles.tableHeader}>
            <h2>{table}</h2>
            {meta.count !== undefined && (
              <span className={styles.totalCount}>
                Total: {meta.count} records
              </span>
            )}
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          {loading ? (
            <div className={styles.loading}>
              <LoadingDots size="md" />
              <span>Loading data...</span>
            </div>
          ) : (
            <>
              <DataTable data={data} table={table} />
              
              {meta.pages > 1 && (
                <div className={styles.pagination}>
                  <Button 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={styles.paginationButton}
                  >
                    Previous
                  </Button>
                  
                  <span className={styles.pageInfo}>
                    Page {page} of {meta.pages}
                  </span>
                  
                  <Button 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === meta.pages}
                    className={styles.paginationButton}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Create a page module CSS
export default function DBExplorerPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center h-screen">
          <LoadingDots size="lg" />
        </div>
      }>
        <DBExplorer />
      </Suspense>
    </MainLayout>
  );
} 