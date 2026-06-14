import { useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import {
  deleteData,
  deleteImages,
  fetchDataFromApi,
  uploadImage,
} from "../../utils/api";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ImageUploadField({
  uploadEndpoint,
  deleteImageEndpoint,
  previews,
  setPreviews,
  setAlertBox,
  multiple = true,
  clearStagingOnMount = true,
}) {
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!clearStagingOnMount) return;
    fetchDataFromApi("/api/imageUpload").then((res) => {
      if (res?.length) {
        res.forEach((item) => {
          item?.images?.forEach((img) => {
            if (deleteImageEndpoint) {
              deleteImages(`${deleteImageEndpoint}?img=${encodeURIComponent(img)}`).then(() => {
                deleteData("/api/imageUpload/deleteAllImages");
              });
            }
          });
        });
      }
    });
  }, [clearStagingOnMount, deleteImageEndpoint]);

  const refreshPreviews = () => {
    fetchDataFromApi("/api/imageUpload").then((response) => {
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

  const onChangeFile = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const formdata = new FormData();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!ACCEPTED.includes(file.type)) {
        setAlertBox?.({ open: true, error: true, msg: "Please select a valid JPG, PNG, or WebP image." });
        setUploading(false);
        return;
      }
      formdata.append("images", file);
    }

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
      setAlertBox?.({ open: true, error: false, msg: "Images uploaded!" });
    } catch {
      setAlertBox?.({ open: true, error: true, msg: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImg = (index, imgUrl) => {
    if (deleteImageEndpoint) {
      deleteImages(`${deleteImageEndpoint}?img=${encodeURIComponent(imgUrl)}`).then(() => {
        setAlertBox?.({ open: true, error: false, msg: "Image removed." });
      });
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="admin-dash__upload-grid">
      {previews.map((img, index) => (
        <div className="admin-dash__upload-box" key={`${img}-${index}`}>
          <button
            type="button"
            className="admin-dash__upload-remove"
            onClick={() => removeImg(index, img)}
            aria-label="Remove image"
          >
            <IoCloseSharp />
          </button>
          <img src={img} alt="" />
        </div>
      ))}
      <div className="admin-dash__upload-box">
        {uploading ? (
          <div className="admin-dash__upload-loading">
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            Uploading…
          </div>
        ) : (
          <label className="admin-dash__upload-add">
            <input type="file" multiple={multiple} accept={ACCEPTED.join(",")} onChange={onChangeFile} />
            <FaCloudUploadAlt size={22} />
            <span>Add images</span>
          </label>
        )}
      </div>
    </div>
  );
}
