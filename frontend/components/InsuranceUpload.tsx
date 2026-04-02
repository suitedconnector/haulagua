"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle2, X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface InsuranceUploadProps {
  label: string;
  hint?: string;
  uploadedUrl: string;
  onUpload: (url: string) => void;
  onClear: () => void;
}

export function InsuranceUpload({
  label,
  hint,
  uploadedUrl,
  onUpload,
  onClear,
}: InsuranceUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setFileName(file.name);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? "Upload failed. Please try again.");
        setFileName("");
        return;
      }

      onUpload(data.url);
    } catch {
      setError("Network error. Please try again.");
      setFileName("");
    } finally {
      setUploading(false);
    }
  }

  function handleClear() {
    setFileName("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    onClear();
  }

  return (
    <div className="space-y-1.5">
      <Label className="font-semibold text-[#333333]">{label}</Label>
      {hint && <p className="text-xs text-gray-500 -mt-0.5">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="sr-only"
        onChange={handleChange}
        aria-label={label}
      />

      {!uploadedUrl ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6 px-4 transition-colors text-center ${
            uploading
              ? "border-gray-200 bg-gray-50 cursor-wait"
              : "border-gray-300 hover:border-[#005A9C] hover:bg-[#005A9C]/5 cursor-pointer"
          }`}
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-[#005A9C] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Uploading…</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to upload{" "}
                <span className="text-[#005A9C] font-medium">PDF or image</span>
              </span>
              <span className="text-xs text-gray-400">PDF, JPG, or PNG — max 10 MB</span>
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800 truncate">
              {fileName || "Certificate uploaded"}
            </p>
            <p className="text-xs text-green-600">Uploaded successfully</p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-green-600 hover:text-green-800 transition-colors shrink-0"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
