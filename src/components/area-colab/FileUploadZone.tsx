'use client';

import React, { useCallback, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFilesSelected?: (files: File[]) => void;
  acceptedFileTypes?: string;
  maxFiles?: number;
  className?: string;
}

export function FileUploadZone({
  onFilesSelected,
  acceptedFileTypes = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxFiles = 5,
  className
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (uploadedFiles.length + files.length > maxFiles) {
        alert(`Máximo de ${maxFiles} arquivos permitidos.`);
        return;
      }
      setUploadedFiles((prev) => [...prev, ...files]);
      onFilesSelected?.(files);
    },
    [uploadedFiles.length, maxFiles, onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        if (uploadedFiles.length + files.length > maxFiles) {
          alert(`Máximo de ${maxFiles} arquivos permitidos.`);
          return;
        }
        setUploadedFiles((prev) => [...prev, ...files]);
        onFilesSelected?.(files);
      }
    },
    [uploadedFiles.length, maxFiles, onFilesSelected]
  );

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-slate-300 hover:border-primary-400 bg-slate-50'
        )}
      >
        <input
          type="file"
          multiple
          accept={acceptedFileTypes}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">
            Arraste arquivos aqui ou <span className="text-primary-600 font-medium">clique para selecionar</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Formatos aceitos: {acceptedFileTypes}
          </p>
        </label>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200"
            >
              <File size={16} className="text-slate-400" />
              <span className="flex-1 text-sm text-slate-700 truncate">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
