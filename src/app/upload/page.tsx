'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface UploadResult {
  success: boolean;
  data?: {
    uploadedFiles: Array<{
      originalName: string;
      filename: string;
      size: number;
      type: string;
      uploadTime: string;
      transactionsExtracted?: number;
    }>;
    errors?: string[];
    totalFiles: number;
    successfulUploads: number;
    totalTransactionsExtracted?: number;
  };
  error?: string;
  message?: string;
}

export default function UploadPage() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result: UploadResult = await response.json();
      setUploadResult(result);

      if (result.success) {
        setFiles([]);
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Upload Bills</h1>
        <p className={styles.subtitle}>Securely upload your CSV, PDF, or JSON bills for automated charge detection.</p>
      </header>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".csv,.pdf,.json,.txt,.xls,.xlsx"
        onChange={handleFileSelect}
        className={styles.hiddenFileInput}
        aria-label="Upload bills and documents"
        title="Upload bills and documents"
      />

      <div 
        className={`${styles.dropZone} ${isDragActive ? styles.active : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <div className={styles.dropIcon}>[ FILE ]</div>
        <h3 className={styles.dropTitle}>Drag & Drop files here</h3>
        <p className={styles.dropSubtitle}>or click to browse your files</p>
        <button 
          type="button"
          className={styles.browseBtn}
          onClick={(e) => {
            e.stopPropagation();
            handleBrowseClick();
          }}
        >
          Browse Files
        </button>
      </div>

      {files.length > 0 && (
        <div className={styles.fileList}>
          <h4 className={styles.listTitle}>Selected Files</h4>
          {files.map((f, i) => (
            <div key={i} className={styles.fileItem}>
              <span>-&gt; {f.name}</span>
              <span className={styles.fileSize}>{(f.size / 1024).toFixed(1)} KB</span>
            </div>
          ))}
          <button 
            className={styles.uploadSubmitBtn}
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Analyze Bills'}
          </button>
        </div>
      )}

      {/* Upload Results */}
      {uploadResult && (
        <div className={`${styles.uploadResult} ${uploadResult.success ? styles.success : styles.error}`}>
          <h4>
            {uploadResult.success 
              ? `Successfully uploaded ${uploadResult.data?.successfulUploads} of ${uploadResult.data?.totalFiles} files`
              : 'Upload Failed'
            }
          </h4>
          
          {uploadResult.success && uploadResult.data?.totalTransactionsExtracted && uploadResult.data.totalTransactionsExtracted > 0 && (
            <div className={styles.transactionSummary}>
              <span className={styles.transactionCount}>
                📊 {uploadResult.data.totalTransactionsExtracted} transactions extracted
              </span>
              <span className={styles.nextSteps}>
                💡 View detected charges in the <Link href="/detector" className={styles.detectorLink}>Detector</Link>
              </span>
            </div>
          )}
          
          {uploadResult.success && uploadResult.data?.uploadedFiles && (
            <div className={styles.uploadedFiles}>
              {uploadResult.data.uploadedFiles.map((file, i) => (
                <div key={i} className={styles.uploadedFileItem}>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>✓ {file.originalName}</span>
                    {file.transactionsExtracted !== undefined && (
                      <span className={styles.transactionCount}>
                        {file.transactionsExtracted} transactions
                      </span>
                    )}
                  </div>
                  <span className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          )}

          {uploadResult.data?.errors && uploadResult.data.errors.length > 0 && (
            <div className={styles.errors}>
              <h5>Errors:</h5>
              {uploadResult.data.errors.map((error, i) => (
                <div key={i} className={styles.errorItem}>{error}</div>
              ))}
            </div>
          )}

          {!uploadResult.success && uploadResult.message && (
            <div className={styles.errorMessage}>{uploadResult.message}</div>
          )}

          <button 
            className={styles.clearResultBtn}
            onClick={() => setUploadResult(null)}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
