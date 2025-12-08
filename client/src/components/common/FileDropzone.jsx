import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * @param {Object} props
 * @param {(files: FileList) => void} props.onFilesSelected
 * @param {string} [props.accept] - MIME types or file extensions
 * @param {string} [props.className]
 */
export function FileDropzone({ onFilesSelected, accept, className = '' }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={clsx('inline-flex', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        multiple={false}
      />
      <button
        type="button"
        onClick={handleClick}
        className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950"
        aria-label="Upload file"
      >
        <Upload size={20} />
      </button>
    </div>
  );
}


