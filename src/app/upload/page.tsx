'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function UploadPage() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

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

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Upload Bills</h1>
        <p className={styles.subtitle}>Securely upload your CSV, PDF, or JSON bills for automated charge detection.</p>
      </header>

      <div 
        className={`${styles.dropZone} ${isDragActive ? styles.active : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={styles.dropIcon}>[ FILE ]</div>
        <h3 className={styles.dropTitle}>Drag & Drop files here</h3>
        <p className={styles.dropSubtitle}>or click to browse your files</p>
        <button className={styles.browseBtn}>Browse Files</button>
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
          <button className={styles.uploadSubmitBtn}>Analyze Bills</button>
        </div>
      )}
    </div>
  );
}
