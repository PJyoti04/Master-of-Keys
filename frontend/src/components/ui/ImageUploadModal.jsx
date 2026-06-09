import { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  X,
  Image as ImageIcon,
} from "lucide-react";

export default function ImageUploadModal({
  open,
  onClose,
  onUpload,
  loading,
  progress,
  title = "Upload Image",
}) {
  const [selectedFile, setSelectedFile] =
    useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
    }
  }, [open]);

  if (!open) return null;

  const handleFileSelect = (file) => {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (
      !allowedTypes.includes(file.type)
    ) {
      alert(
        "Only JPG, JPEG, PNG, WEBP and GIF files are allowed."
      );
      return;
    }

    setSelectedFile(file);
  };

  const radius = 18;
  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (progress / 100) * circumference;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => !loading && onClose()}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between pb-4">
          <h2 className="text-xl font-semibold text-orange-500">{title}</h2>

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 text-orange-500 bg-orange-500/20"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileSelect(e.dataTransfer.files[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-orange-300 p-10 transition-all hover:border-orange-500 hover:bg-orange-50/50"
        >
          {/* Selected File */}
          {selectedFile ? (
            <div className="mt-5 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                {loading ? (
                  <div className="relative h-12 w-12 shrink-0">
                    <svg className="h-12 w-12 -rotate-90" viewBox="0 0 50 50">
                      <circle
                        cx="25"
                        cy="25"
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                      />

                      <circle
                        cx="25"
                        cy="25"
                        r={radius}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{
                          transition: "stroke-dashoffset .3s ease",
                        }}
                      />
                    </svg>

                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold">
                      {progress}%
                    </span>
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                    <ImageIcon size={22} className="text-orange-500" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{selectedFile.name}</p>

                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <UploadCloud size={50} className="mx-auto text-orange-500" />

              <h3 className="mt-4 text-center font-medium">
                Drag & Drop Image
              </h3>

              <p className="mt-1 text-center text-sm text-gray-500">
                or click to browse
              </p>

              <p className="mt-2 text-center text-xs text-gray-400">
                JPG • JPEG • PNG • WEBP • GIF
              </p>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />

        <button
          disabled={!selectedFile || loading}
          onClick={() => onUpload(selectedFile)}
          className="mt-5 w-full rounded-xl bg-orange-500 py-3 font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Photo"}
        </button>
      </div>
    </div>
  );
}