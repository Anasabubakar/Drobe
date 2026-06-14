"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface QueueFile {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  errorMsg?: string;
}

export default function WardrobeAddPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newItems: QueueFile[] = Array.from(files)
      .filter(f => f.type.startsWith("image/"))
      .map(f => ({
        id: `${Date.now()}-${Math.random()}`,
        file: f,
        preview: URL.createObjectURL(f),
        status: "pending",
      }));
    setQueue(prev => [...prev, ...newItems]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeItem = (id: string) => {
    setQueue(prev => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const handleProcess = async () => {
    const pending = queue.filter(i => i.status === "pending");
    if (pending.length === 0) return;

    setProcessing(true);
    setDoneCount(0);
    let done = 0;

    for (const item of pending) {
      setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: "uploading" } : i));
      try {
        const formData = new FormData();
        formData.append("image", item.file);
        // Let AI detect name/category automatically (skipAI=false by default)

        const res = await fetch("/api/wardrobe", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(err.error ?? "Upload failed");
        }
        setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: "done" } : i));
        done++;
        setDoneCount(done);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: "error", errorMsg: msg } : i));
      }
    }

    setProcessing(false);

    // If all succeeded, navigate to wardrobe after a moment
    if (done === pending.length) {
      setTimeout(() => router.push("/wardrobe"), 800);
    }
  };

  const pendingCount = queue.filter(i => i.status === "pending").length;
  const totalCount = queue.length;

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface h-16 border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-4 h-full max-w-7xl mx-auto">
          <Link href="/wardrobe">
            <button className="text-on-surface-variant hover:opacity-70 active:scale-95 transition-all">
              <span className="material-symbols-outlined">close</span>
            </button>
          </Link>
          <h1 className="text-label-md font-label-md font-semibold text-on-surface">Add to Closet</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="pt-20 pb-36 px-4 max-w-2xl mx-auto w-full flex-1">
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="relative cursor-pointer rounded-2xl flex flex-col items-center justify-center py-12 mb-6 transition-all"
          style={{
            border: `2px dashed ${dragging ? "#e75a66" : "rgba(140,113,113,0.3)"}`,
            backgroundColor: dragging ? "rgba(231,90,102,0.04)" : "transparent",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => addFiles(e.target.files)}
          />
          <span
            className="material-symbols-outlined text-[48px] mb-3"
            style={{ color: dragging ? "#e75a66" : "#dfbfbf" }}
          >
            add_photo_alternate
          </span>
          <p className="text-label-md font-label-md font-semibold text-on-surface mb-1">
            Drop photos here
          </p>
          <p className="text-body-md font-body-md text-on-surface-variant text-center text-sm">
            or tap to select from your device
          </p>
          <p className="text-label-sm font-label-sm text-on-surface-variant/60 mt-2 text-[11px] uppercase tracking-widest">
            JPG, PNG, HEIC — multiple allowed
          </p>
        </div>

        {/* Queue */}
        {queue.length > 0 && (
          <div className="space-y-3">
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest">
              {totalCount} {totalCount === 1 ? "photo" : "photos"} queued
            </p>
            {queue.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-surface-container-lowest rounded-2xl p-3 soft-ambient-shadow border border-outline-variant/10">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container flex-none">
                  <img src={item.preview} alt={item.file.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-label-md font-label-md text-on-surface truncate">{item.file.name}</p>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">
                    {(item.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  {item.status === "uploading" && (
                    <p className="text-[12px] mt-1" style={{ color: "#e75a66" }}>Uploading &amp; analysing…</p>
                  )}
                  {item.status === "done" && (
                    <p className="text-[12px] text-tertiary mt-1">Added to wardrobe</p>
                  )}
                  {item.status === "error" && (
                    <p className="text-[12px] text-error mt-1 truncate">{item.errorMsg}</p>
                  )}
                </div>
                <div className="flex-none">
                  {item.status === "pending" && (
                    <button onClick={() => removeItem(item.id)} className="text-on-surface-variant/60 hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  )}
                  {item.status === "uploading" && (
                    <span className="material-symbols-outlined text-[20px] animate-spin" style={{ color: "#e75a66" }}>progress_activity</span>
                  )}
                  {item.status === "done" && (
                    <span className="material-symbols-outlined text-[20px] text-tertiary">check_circle</span>
                  )}
                  {item.status === "error" && (
                    <span className="material-symbols-outlined text-[20px] text-error">error</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer action */}
      {queue.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full glass-nav border-t border-outline-variant/10 px-4 py-4 pb-8">
          <div className="max-w-2xl mx-auto">
            {processing && (
              <p className="text-center text-label-sm font-label-sm text-on-surface-variant mb-3">
                Uploading {doneCount}/{pendingCount} items…
              </p>
            )}
            <button
              onClick={handleProcess}
              disabled={processing || pendingCount === 0}
              className="w-full h-14 text-white rounded-2xl text-label-md font-label-md font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: "#e75a66" }}
            >
              {processing ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              )}
              {processing ? "Processing…" : `Add ${pendingCount} ${pendingCount === 1 ? "Item" : "Items"} to Closet`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
