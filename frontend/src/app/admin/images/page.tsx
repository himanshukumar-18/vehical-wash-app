"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Sparkles,
  Link as LinkIcon,
  Tag,
  Info,
  Maximize2,
  FileText,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { AppDispatch } from "../../../lib/store";
import {
  fetchAdminImages,
  uploadAdminImage,
  updateAdminImage,
  resetAdminImage,
  removeAdminImage,
  selectAdminImages,
  selectImagesLoading,
  selectUploadingKey,
  selectImageError,
  selectImageSuccess,
  clearMessages,
} from "../../../lib/slices/imageSlice";
import { DynamicImageItem } from "../../../lib/api/imageApi";

const CATEGORIES = [
  "All",
  "Hero & Banners",
  "About Us",
  "Work & Gallery",
  "Why Choose Us",
  "Contact Us",
  "FAQ & Support",
];

export default function AdminImagesPage() {
  const dispatch = useDispatch<AppDispatch>();

  const images = useSelector(selectAdminImages);
  const loading = useSelector(selectImagesLoading);
  const uploadingKey = useSelector(selectUploadingKey);
  const error = useSelector(selectImageError);
  const successMessage = useSelector(selectImageSuccess);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewImage, setPreviewImage] = useState<DynamicImageItem | null>(null);

  useEffect(() => {
    dispatch(fetchAdminImages());
  }, [dispatch]);

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  const filteredImages = images.filter((img) => {
    const matchesCategory = selectedCategory === "All" || img.category === selectedCategory;
    const matchesSearch =
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.badge_tag && img.badge_tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#26313A] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#19C7F3]" />
            <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-[#F5F7F8] sm:text-3xl">
              Dynamic Image Management (CMS)
            </h1>
          </div>
          <p className="mt-1 text-xs text-[#A7B0B7] sm:text-sm">
            Upload, update, and activate promotional banners & section images across The Black Wash website in real time without developer code changes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(fetchAdminImages())}
          className="inline-flex items-center gap-2 rounded-lg border border-[#26313A] bg-[#0D1115] px-4 py-2.5 text-xs font-semibold text-[#F5F7F8] transition hover:border-[#19C7F3] hover:text-[#19C7F3]"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-[#19C7F3]" : ""}`} />
          Refresh Inventory
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#26313A] bg-[#0D1115] p-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-[#19C7F3] text-[#050708]"
                  : "text-[#A7B0B7] hover:bg-[#1D252B] hover:text-[#F5F7F8]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search image slot or banner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#26313A] bg-[#080A0C] px-3.5 py-2 text-xs text-[#F5F7F8] placeholder-[#707A82] focus:border-[#19C7F3] focus:outline-none"
          />
        </div>
      </div>

      {/* Image Cards Grid */}
      {loading && images.length === 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 animate-pulse rounded-xl border border-[#26313A] bg-[#0D1115]" />
          ))}
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="rounded-xl border border-[#26313A] bg-[#0D1115] py-16 text-center">
          <p className="text-sm font-semibold text-[#F5F7F8]">No image slots match your search criteria.</p>
          <p className="mt-1 text-xs text-[#707A82]">Try selecting another category or clear search query.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredImages.map((img) => (
            <ImageSlotCard
              key={img.key}
              imageItem={img}
              isUploading={uploadingKey === img.key}
              onPreview={() => setPreviewImage(img)}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          imageItem={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}

function ImageSlotCard({
  imageItem,
  isUploading,
  onPreview,
}: {
  imageItem: DynamicImageItem;
  isUploading: boolean;
  onPreview: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const [badgeTag, setBadgeTag] = useState(imageItem.badge_tag || "");
  const [linkUrl, setLinkUrl] = useState(imageItem.link_url || "");
  const [isActive, setIsActive] = useState(imageItem.is_active);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, variant: "desktop" | "mobile" = "desktop") => {
    const file = e.target.files?.[0];
    if (file) {
      dispatch(uploadAdminImage({ key: imageItem.key, file, variant }));
    }
  };

  const handleSaveMetadata = async () => {
    setIsSaving(true);
    try {
      await dispatch(
        updateAdminImage({
          key: imageItem.key,
          data: {
            badge_tag: badgeTag,
            link_url: linkUrl || null,
            is_active: isActive,
          },
        })
      ).unwrap();
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm(`Reset '${imageItem.title}' slot?`)) {
      dispatch(resetAdminImage(imageItem.key));
    }
  };

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to remove image for '${imageItem.title}'? It will no longer show on the customer site.`)) {
      dispatch(removeAdminImage(imageItem.key));
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#26313A] bg-[#0D1115] transition duration-300 hover:border-[#19C7F3]/40">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-[#26313A] bg-[#080A0C] px-4 py-3">
        <span className="rounded-full bg-[#19C7F3]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#19C7F3]">
          {imageItem.category}
        </span>

        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-[10px] font-semibold uppercase text-[#A7B0B7]">
            {isActive ? "Active" : "Disabled"}
          </span>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => {
              setIsActive(e.target.checked);
              dispatch(
                updateAdminImage({
                  key: imageItem.key,
                  data: { is_active: e.target.checked },
                })
              );
            }}
            className="h-4 w-4 rounded border-[#26313A] bg-[#080A0C] text-[#19C7F3] focus:ring-0"
          />
        </label>
      </div>

      {/* Image Preview Container */}
      <div className="relative h-48 w-full overflow-hidden bg-[#050708]">
        {imageItem.desktop_image_url ? (
          <Image
            src={imageItem.desktop_image_url}
            alt={imageItem.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-xs text-[#707A82] gap-1">
            <span>No image uploaded</span>
            <span className="text-[10px] text-[#A7B0B7]">(Customer site won't show default photos)</span>
          </div>
        )}

        {imageItem.desktop_image_url && (
          <button
            type="button"
            onClick={onPreview}
            className="absolute right-3 top-3 rounded-lg bg-[#050708]/80 p-2 text-[#F5F7F8] backdrop-blur-sm transition hover:bg-[#19C7F3] hover:text-[#050708]"
            title="Zoom Preview"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050708]/80 backdrop-blur-sm">
            <RefreshCw className="h-6 w-6 animate-spin text-[#19C7F3]" />
            <span className="mt-2 text-xs font-bold text-[#F5F7F8]">Uploading HD Image to Cloudinary...</span>
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="flex flex-1 flex-col p-4 space-y-4">
        <div>
          <h3 className="font-heading text-base font-bold text-[#F5F7F8]">{imageItem.title}</h3>
          <p className="mt-0.5 text-[11px] font-mono text-[#707A82]">key: {imageItem.key}</p>
        </div>

        {/* Specifications Guide */}
        <div className="rounded-lg border border-[#26313A] bg-[#080A0C] p-3 text-[11px] space-y-1.5">
          <div className="flex justify-between text-[#A7B0B7]">
            <span>Recommended:</span>
            <span className="font-semibold text-[#19C7F3]">{imageItem.recommended_resolution}</span>
          </div>
          <div className="flex justify-between text-[#A7B0B7]">
            <span>Max Limit:</span>
            <span className="font-semibold text-emerald-400">50 MB (HD Supported)</span>
          </div>
          <div className="flex justify-between text-[#A7B0B7]">
            <span>Uploaded Size:</span>
            <span className="font-semibold text-[#F5F7F8]">
              {imageItem.width && imageItem.height ? `${imageItem.width}x${imageItem.height} px` : "N/A"}
            </span>
          </div>
          <div className="flex justify-between text-[#A7B0B7]">
            <span>Format & Size:</span>
            <span className="font-semibold text-[#F5F7F8]">
              {imageItem.format || "WEBP"} ({imageItem.file_size_mb || 0} MB)
            </span>
          </div>
        </div>

        {/* Dynamic Promotional Inputs */}
        <div className="space-y-2.5">
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A7B0B7]">
              <Tag className="h-3 w-3 text-[#19C7F3]" /> Badge / Offer Tag
            </label>
            <input
              type="text"
              placeholder="e.g. DIWALI OFFER 20% OFF"
              value={badgeTag}
              onChange={(e) => setBadgeTag(e.target.value)}
              className="mt-1 w-full rounded border border-[#26313A] bg-[#080A0C] px-3 py-1.5 text-xs text-[#F5F7F8] placeholder-[#707A82] focus:border-[#19C7F3] focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A7B0B7]">
              <LinkIcon className="h-3 w-3 text-[#19C7F3]" /> Promotional Target Link
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="mt-1 w-full rounded border border-[#26313A] bg-[#080A0C] px-3 py-1.5 text-xs text-[#F5F7F8] placeholder-[#707A82] focus:border-[#19C7F3] focus:outline-none"
            />
          </div>
        </div>

        {/* File Upload & Actions */}
        <div className="pt-2 space-y-2">
          <label className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#19C7F3]/50 bg-[#19C7F3]/5 py-2.5 text-xs font-bold text-[#19C7F3] cursor-pointer hover:bg-[#19C7F3]/10 transition">
            <Upload className="h-4 w-4" />
            <span>Upload HD Image (Up to 50MB)</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, "desktop")}
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveMetadata}
              disabled={isSaving}
              className="flex-1 rounded-lg bg-[#19C7F3] py-2 text-xs font-bold text-[#050708] hover:bg-[#19C7F3]/90 transition"
            >
              {isSaving ? "Saving..." : "Save Details"}
            </button>

            {imageItem.desktop_image_url && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 hover:border-red-500/60 transition"
                title="Remove Image"
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-[#26313A] p-2 text-[#A7B0B7] hover:border-[#19C7F3]/50 hover:text-[#19C7F3] transition"
              title="Reset Slot"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImagePreviewModal({
  imageItem,
  onClose,
}: {
  imageItem: DynamicImageItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-2xl border border-[#26313A] bg-[#0D1115] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#26313A] pb-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-[#F5F7F8]">{imageItem.title}</h3>
            <p className="text-xs text-[#19C7F3]">Location Key: {imageItem.key}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#1D252B] px-3 py-1.5 text-xs font-bold text-[#F5F7F8] hover:bg-[#26313A]"
          >
            Close
          </button>
        </div>

        <div className="relative h-[60vh] w-full overflow-hidden rounded-xl bg-[#050708]">
          {imageItem.desktop_image_url ? (
            <Image
              src={imageItem.desktop_image_url}
              alt={imageItem.title}
              fill
              className="object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#707A82]">
              No image available
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-between gap-4 text-xs text-[#A7B0B7]">
          <div>
            <span className="font-semibold text-[#F5F7F8]">Resolution: </span>
            {imageItem.width && imageItem.height ? `${imageItem.width}x${imageItem.height} px` : "N/A"}
          </div>
          <div>
            <span className="font-semibold text-[#F5F7F8]">Format: </span>
            {imageItem.format || "WEBP"}
          </div>
          <div>
            <span className="font-semibold text-[#F5F7F8]">Size: </span>
            {imageItem.file_size_mb || 0} MB
          </div>
          <div>
            <span className="font-semibold text-[#F5F7F8]">URL: </span>
            <a href={imageItem.desktop_image_url} target="_blank" rel="noreferrer" className="text-[#19C7F3] underline">
              View Direct Image
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
