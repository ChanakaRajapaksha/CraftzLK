import { useRef, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { deleteImages, uploadImage } from "../../utils/api";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function VariantImageUploadField({
  value = "",
  onChange,
  setAlertBox,
  uploadEndpoint = "/api/products/upload",
  deleteImageEndpoint = "/api/products/deleteImage",
  label = "variant image",
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const onChangeFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      setAlertBox?.({ open: true, error: true, msg: "Please select a valid JPG, PNG, or WebP image." });
      return;
    }

    setUploading(true);
    const formdata = new FormData();
    formdata.append("images", file);

    try {
      const uploaded = await uploadImage(uploadEndpoint, formdata);
      const url = Array.isArray(uploaded) ? uploaded[0] : "";
      if (!url) throw new Error("Upload failed");
      onChange?.(url);
      setAlertBox?.({ open: true, error: false, msg: "Image uploaded." });
    } catch {
      setAlertBox?.({ open: true, error: true, msg: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const removeImg = () => {
    if (value && deleteImageEndpoint) {
      deleteImages(`${deleteImageEndpoint}?img=${encodeURIComponent(value)}`).catch(() => {});
    }
    onChange?.("");
  };

  if (uploading) {
    return (
      <div className="admin-dash__variant-image admin-dash__variant-image--loading">
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
        <span>Uploading…</span>
      </div>
    );
  }

  if (value) {
    return (
      <div className="admin-dash__variant-image">
        <img src={value} alt={label} className="admin-dash__variant-image-thumb" />
        <button
          type="button"
          className="admin-dash__variant-image-remove"
          onClick={removeImg}
          aria-label={`Remove ${label}`}
        >
          <IoCloseSharp />
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dash__variant-image">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="admin-dash__variant-image-input"
        onChange={onChangeFile}
        aria-label={`Upload ${label}`}
      />
      <button
        type="button"
        className="admin-dash__variant-image-add"
        onClick={() => fileInputRef.current?.click()}
      >
        <FaCloudUploadAlt aria-hidden />
        <span>Upload</span>
      </button>
    </div>
  );
}
