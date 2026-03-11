"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, X, CheckCircle, Loader2, AlertCircle } from "lucide-react";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  existingUrl?: string;
  accept?: string;
}

export function FileUpload({ onUploadComplete, existingUrl, accept = ".pdf,.doc,.docx" }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;
      setError(null);

      // 5 MB limit
      if (file.size > 5 * 1024 * 1024) {
        setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 5 MB.`);
        return;
      }

      setUploading(true);
      setFileName(file.name);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Upload failed");
        }

        const { url } = await res.json();
        setUploadedUrl(url);
        onUploadComplete(url);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
        setFileName(null);
      } finally {
        setUploading(false);
      }
    },
    [onUploadComplete]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clear = () => {
    setUploadedUrl(null);
    setFileName(null);
    setError(null);
    onUploadComplete("");
  };

  if (uploadedUrl) {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-emerald-400">File uploaded</p>
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-white truncate block"
          >
            {fileName || uploadedUrl}
          </a>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-slate-500 hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-3 w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          isDragging
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-slate-600/50 bg-[#0f172a]/30 hover:border-indigo-500/50 hover:bg-indigo-500/5"
        }`}
      >
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-400">Uploading {fileName}…</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
              {isDragging ? (
                <FileText className="w-5 h-5 text-indigo-400" />
              ) : (
                <Upload className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-300">
                <span className="text-indigo-400 font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-0.5">PDF, DOC, DOCX accepted</p>
            </div>
          </>
        )}
      </label>
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
