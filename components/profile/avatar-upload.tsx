"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { toast } from "sonner";

export function AvatarUpload({
  value,
  onChange,
  label = "Profile photo",
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [imgMeta, setImgMeta] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [sx, setSx] = useState<number>(0); // source x in original image
  const [sy, setSy] = useState<number>(0); // source y in original image
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  const handlePick = () => fileInputRef.current?.click();

  // Crop image to centered square on client before upload
  // Helper: read file as data URL
  const readAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  // Draw cropped preview to a given canvas size from current sx, sy, zoom
  const drawPreview = useCallback(() => {
    if (!editorSrc || !imgMeta || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new window.Image();
    img.onload = () => {
      const baseSize = Math.min(imgMeta.w, imgMeta.h);
      const cropSize = baseSize / zoom;
      const clampedSx = Math.max(0, Math.min(sx, imgMeta.w - cropSize));
      const clampedSy = Math.max(0, Math.min(sy, imgMeta.h - cropSize));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        clampedSx,
        clampedSy,
        cropSize,
        cropSize,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    };
    img.src = editorSrc;
  }, [editorSrc, imgMeta, sx, sy, zoom]);

  const clampCrop = useCallback(
    (nextSx: number, nextSy: number) => {
      if (!imgMeta) return { sx: nextSx, sy: nextSy };
      const baseSize = Math.min(imgMeta.w, imgMeta.h);
      const cropSize = baseSize / zoom;
      const maxSx = Math.max(0, imgMeta.w - cropSize);
      const maxSy = Math.max(0, imgMeta.h - cropSize);
      return {
        sx: Math.max(0, Math.min(nextSx, maxSx)),
        sy: Math.max(0, Math.min(nextSy, maxSy)),
      };
    },
    [imgMeta, zoom],
  );

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!editorSrc || !imgMeta) return;
    setDragging(true);
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [editorSrc, imgMeta]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !lastPointer.current || !imgMeta || !previewCanvasRef.current) return;
    e.preventDefault();
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    const canvas = previewCanvasRef.current;
    const baseSize = Math.min(imgMeta.w, imgMeta.h);
    const cropSize = baseSize / zoom;
    const scale = cropSize / (canvas.width || 240);
    const next = clampCrop(sx - dx * scale, sy - dy * scale);
    setSx(next.sx);
    setSy(next.sy);
    lastPointer.current = { x: e.clientX, y: e.clientY };
  }, [dragging, imgMeta, sx, sy, zoom, clampCrop]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    lastPointer.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  }, []);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  const cropCenterSquare = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const size = Math.min(img.naturalWidth, img.naturalHeight);
          const sx = (img.naturalWidth - size) / 2;
          const sy = (img.naturalHeight - size) / 2;
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas not supported'));
          // Draw cropped square scaled to 512x512
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 512, 512);
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Failed to crop image'));
              resolve(blob);
            },
            'image/jpeg',
            0.9,
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large (max 5MB)");
      return;
    }

    try {
      const dataUrl = await readAsDataURL(file);
      // Initialize editor for manual cropping
      const img = new window.Image();
      img.onload = () => {
        setImgMeta({ w: img.naturalWidth, h: img.naturalHeight });
        const base = Math.min(img.naturalWidth, img.naturalHeight);
        // center square defaults
        setZoom(1);
        setSx((img.naturalWidth - base) / 2);
        setSy((img.naturalHeight - base) / 2);
        setEditorSrc(dataUrl);
      };
      img.src = dataUrl;
    } catch (e) {
      toast.error('Failed to load image');
    }
  };

  const applyCropAndUpload = async () => {
    if (!editorSrc || !imgMeta) return;
    if (!user?.uid) {
      toast.error("You must be signed in to upload a photo");
      return;
    }
    try {
      setUploading(true);
      const img = new window.Image();
      const croppedBlob: Blob = await new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas not supported'));
          const baseSize = Math.min(imgMeta.w, imgMeta.h);
          const cropSize = baseSize / zoom;
          const clampedSx = Math.max(0, Math.min(sx, imgMeta.w - cropSize));
          const clampedSy = Math.max(0, Math.min(sy, imgMeta.h - cropSize));
          ctx.drawImage(img, clampedSx, clampedSy, cropSize, cropSize, 0, 0, 512, 512);
          canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Failed to crop'))), 'image/jpeg', 0.9);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = editorSrc;
      });

      const croppedUrl = URL.createObjectURL(croppedBlob);
      setPreview(croppedUrl);

      // Upload to server-side endpoint instead of direct Firebase Storage
      const formData = new FormData();
      formData.append('file', croppedBlob, 'profile.jpg');
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const { url } = await response.json();
      onChange(url);
      setEditorSrc(null);
      toast.success('Profile photo uploaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (!((preview as string) || value)) return;
    const ok = window.confirm('Remove your profile photo?');
    if (!ok) return;
    onChange(null);
    setPreview(null);
  };

  const imgSrc = (preview as string) || (value as string) || null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {/* Cropping editor */}
      {editorSrc && imgMeta ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div
              className={`relative h-60 w-60 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 select-none touch-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <canvas
                ref={previewCanvasRef}
                width={240}
                height={240}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <label className="text-xs text-slate-600">
                Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="mt-1 w-full"
                />
              </label>
              <div className="flex gap-3">
                <label className="flex-1 text-xs text-slate-600">
                  Position X
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, imgMeta.w - Math.min(imgMeta.w, imgMeta.h) / zoom)}
                    step={1}
                    value={sx}
                    onChange={(e) => setSx(Number(e.target.value))}
                    className="mt-1 w-full"
                  />
                </label>
                <label className="flex-1 text-xs text-slate-600">
                  Position Y
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, imgMeta.h - Math.min(imgMeta.w, imgMeta.h) / zoom)}
                    step={1}
                    value={sy}
                    onChange={(e) => setSy(Number(e.target.value))}
                    className="mt-1 w-full"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={applyCropAndUpload} disabled={uploading}>
                  {uploading ? 'Uploading…' : 'Save crop'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setEditorSrc(null); }} disabled={uploading}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-slate-100">
              {imgSrc ? (
                imgSrc.startsWith('blob:') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imgSrc} alt="Profile photo" className="h-full w-full object-cover" />
                ) : (
            <NextImage src={imgSrc} alt="Profile photo" fill className="object-cover" sizes="80px" />
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                  No photo
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button type="button" onClick={handlePick} disabled={uploading}>
                {uploading ? "Uploading…" : imgSrc ? "Change photo" : "Upload photo"}
              </Button>
              {imgSrc && (
                <Button type="button" variant="outline" onClick={handleRemove} disabled={uploading}>
                  Remove
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500">JPG or PNG up to 5MB.</p>
        </>
      )}
    </div>
  );
}