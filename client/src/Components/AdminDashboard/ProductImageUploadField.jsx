import { useEffect, useRef, useState } from "react";
import { FaCloudUploadAlt, FaGripVertical, FaStar } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import {
  deleteImages,
  uploadImage,
} from "../../utils/api";
import ImageUploadController from "../../controllers/imageUpload.controller.js";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ProductImageUploadField({
  uploadEndpoint,
  deleteImageEndpoint,
  previews,
  setPreviews,
  setAlertBox,
  clearStagingOnMount = true,
  mainImageTitle = "Main Image",
  mainImageDescription = "This image appears first on the product page and in listings.",
  galleryTitle = "Gallery Images",
  galleryDescription = "Drag images to reorder. The first image is used as the main product image.",
  emptyMessage = "No images uploaded yet. Add at least one product image to publish.",
  entityLabel = "product",
  uploadHint = "JPG, PNG, WebP · Multiple files supported",
}) {
  const [uploading, setUploading] = useState(false);
  const [dropActive, setDropActive] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!clearStagingOnMount) return;
    ImageUploadController.getStagingImages().then((res) => {
      if (res?.length) {
        res.forEach((item) => {
          item?.images?.forEach((img) => {
            if (deleteImageEndpoint) {
              deleteImages(`${deleteImageEndpoint}?img=${encodeURIComponent(img)}`).then(() => {
                ImageUploadController.clearStagingImages();
              });
            }
          });
        });
      }
    });
  }, [clearStagingOnMount, deleteImageEndpoint]);

  const refreshPreviews = () => {
    ImageUploadController.getStagingImages().then((response) => {
      if (response?.length) {
        const imgArr = [];
        response.forEach((item) => {
          item?.images?.forEach((img) => imgArr.push(img));
        });
        const unique = imgArr.filter((item, index) => imgArr.indexOf(item) === index);
        setPreviews(unique);
      }
    });
  };

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    for (const file of files) {
      if (!ACCEPTED.includes(file.type)) {
        setAlertBox?.({ open: true, error: true, msg: "Please select valid JPG, PNG, or WebP images only." });
        return;
      }
    }

    setUploading(true);
    const formdata = new FormData();
    files.forEach((file) => formdata.append("images", file));

    try {
      const uploaded = await uploadImage(uploadEndpoint, formdata);
      if (Array.isArray(uploaded) && uploaded.length) {
        setPreviews((prev) => {
          const merged = [...prev, ...uploaded];
          return merged.filter((item, index) => merged.indexOf(item) === index);
        });
      } else {
        refreshPreviews();
      }
      setAlertBox?.({ open: true, error: false, msg: `${files.length > 1 ? "Images" : "Image"} uploaded.` });
    } catch {
      setAlertBox?.({ open: true, error: true, msg: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const onChangeFile = async (e) => {
    await uploadFiles(e.target.files);
    e.target.value = "";
  };

  const onDropFiles = async (e) => {
    e.preventDefault();
    setDropActive(false);
    await uploadFiles(e.dataTransfer.files);
  };

  const removeImg = (index, imgUrl) => {
    if (deleteImageEndpoint) {
      deleteImages(`${deleteImageEndpoint}?img=${encodeURIComponent(imgUrl)}`).then(() => {
        setAlertBox?.({ open: true, error: false, msg: "Image removed." });
      });
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const reorderImages = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setPreviews((prev) => {
      const next = [...prev];
      if (fromIndex >= next.length || toIndex >= next.length) return prev;
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const setAsMain = (index) => {
    reorderImages(index, 0);
  };

  const handleGalleryDragStart = (index) => {
    setDraggingIndex(index);
  };

  const handleGalleryDragOver = (e, index) => {
    e.preventDefault();
    if (draggingIndex !== null && draggingIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleGalleryDrop = (index) => {
    if (draggingIndex !== null) {
      reorderImages(draggingIndex, index);
    }
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const handleGalleryDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const mainImage = previews[0];
  const galleryImages = previews;

  return (
    <div className="admin-dash__product-images">
      <div
        className={`admin-dash__product-images-dropzone${dropActive ? " admin-dash__product-images-dropzone--active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDropActive(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setDropActive(false);
          }
        }}
        onDrop={onDropFiles}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          className="admin-dash__product-images-input"
          onChange={onChangeFile}
        />
        {uploading ? (
          <div className="admin-dash__product-images-dropzone-content">
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            <p>Uploading images…</p>
          </div>
        ) : (
          <button
            type="button"
            className="admin-dash__product-images-dropzone-content"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaCloudUploadAlt size={28} aria-hidden />
            <p><strong>Drag & drop images here</strong> or click to browse</p>
            <span>{uploadHint}</span>
          </button>
        )}
      </div>

      {mainImage && (
        <section className="admin-dash__product-images-section">
          <div className="admin-dash__product-images-section-head">
            <h3 className="admin-dash__product-images-title">{mainImageTitle}</h3>
            <p className="admin-dash__panel-desc">{mainImageDescription}</p>
          </div>
          <div className="admin-dash__product-images-main">
            <img src={mainImage} alt={`Main ${entityLabel}`} />
            <button
              type="button"
              className="admin-dash__product-images-remove"
              onClick={() => removeImg(0, mainImage)}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Remove main image"
            >
              <IoCloseSharp />
            </button>
          </div>
        </section>
      )}

      {galleryImages.length > 0 && (
        <section className="admin-dash__product-images-section">
          <div className="admin-dash__product-images-section-head">
            <h3 className="admin-dash__product-images-title">{galleryTitle}</h3>
            <p className="admin-dash__panel-desc">{galleryDescription}</p>
          </div>
          <div className="admin-dash__product-images-gallery">
            {galleryImages.map((img, index) => (
              <div
                key={`${img}-${index}`}
                className={`admin-dash__product-images-gallery-item${dragOverIndex === index ? " admin-dash__product-images-gallery-item--over" : ""}${draggingIndex === index ? " admin-dash__product-images-gallery-item--dragging" : ""}`}
                draggable
                onDragStart={() => handleGalleryDragStart(index)}
                onDragOver={(e) => handleGalleryDragOver(e, index)}
                onDrop={() => handleGalleryDrop(index)}
                onDragEnd={handleGalleryDragEnd}
              >
                <div className="admin-dash__product-images-gallery-thumb">
                  <img src={img} alt={`${entityLabel} image ${index + 1}`} />
                  {index === 0 ? (
                    <span className="admin-dash__product-images-badge">Main</span>
                  ) : (
                    <button
                      type="button"
                      className="admin-dash__product-images-set-main"
                      onClick={() => setAsMain(index)}
                      onPointerDown={(e) => e.stopPropagation()}
                      title="Set as main image"
                    >
                      <FaStar aria-hidden />
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-dash__product-images-remove"
                    onClick={() => removeImg(index, img)}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <IoCloseSharp />
                  </button>
                </div>
                <div className="admin-dash__product-images-gallery-meta">
                  <FaGripVertical aria-hidden />
                  <span>{index === 0 ? "Main image" : `Image ${index + 1}`}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {galleryImages.length === 0 && (
        <p className="admin-dash__product-images-empty">{emptyMessage}</p>
      )}
    </div>
  );
}
