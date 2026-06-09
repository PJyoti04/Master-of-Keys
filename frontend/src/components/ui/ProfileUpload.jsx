import { Pencil, Trash2, X, Camera } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";

import { AuthContext } from "../../context/AuthContext";
import { uploadImage } from "../../utils/imageKit";
import api from "../../utils/api";
import ImageUploadModal from "./ImageUploadModal";

export default function ProfileUpload() {
  const { userInfo, userInitial, setUserInfo } = useContext(AuthContext);

  const [image, setImage] = useState(null);

  const [showMenu, setShowMenu] = useState(false);

  const [showPreview, setShowPreview] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  const menuRef = useRef(null);
  const editBtnRef = useRef(null);

  const currentImage = image || userInfo?.profileAvatar;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        editBtnRef.current &&
        !editBtnRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpload = async (file) => {
    try {
      setUploading(true);

      const uploaded = await uploadImage(file, userInfo, setUploadProgress);

      await api.patch("upload/profile/avatar", {
        avatarUrl: uploaded.url,
        fileId: uploaded.fileId,
      });

      setImage(uploaded.url);
      setUserInfo((prev) => ({
        ...prev,
        profileAvatar: uploaded.url
      }));

      setShowUploadModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await api.patch("upload/profile/avatar/remove");

      setImage(null);
      setUserInfo((prev) => ({
        ...prev,
        profileAvatar: ""
      }));
      setShowMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="relative w-fit">
        {/* Avatar */}
        <div
          onClick={() => currentImage && setShowPreview(true)}
          className="relative h-28 w-28 cursor-pointer overflow-hidden rounded-full border-4 border-orange-500 bg-orange-500 shadow-lg"
        >
          {currentImage ? (
            <img
              src={currentImage}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
              {userInitial}
            </div>
          )}
        </div>

        {/* Edit Button */}
        <button
          ref={editBtnRef}
          onClick={() => setShowMenu((prev) => !prev)}
          className="absolute bottom-1 right-0 flex translate-x-1/6 translate-y-1/6 items-center gap-2 rounded-full bg-white px-2 py-1 text-xs font-medium text-orange-500 shadow-lg transition hover:bg-orange-50"
        >
          <Camera size={13} />
          Edit
        </button>

        {/* Dropdown */}
        {showMenu && (
          <div
            ref={menuRef}
            className="absolute left-1/2 top-full z-50 mt-6 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
          >
            <button
              onClick={() => {
                setShowMenu(false);
                setShowUploadModal(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 border-b text-orange-500 text-left text-sm hover:bg-orange-500/20"
            >
              <Pencil size={16} />
              Update Photo
            </button>

            <button
              onClick={handleRemovePhoto}
              disabled={!currentImage}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm
              ${
                currentImage
                  ? "text-red-600 hover:bg-red-500/20"
                  : "cursor-not-allowed text-gray-400"
              }`}
            >
              <Trash2 size={16} />
              Remove Photo
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <ImageUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        loading={uploading}
        progress={uploadProgress}
        title="Upload Profile Photo"
      />

      {/* Preview Modal */}
      {showPreview && currentImage && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg"
            >
              <X size={18} />
            </button>

            <img
              src={currentImage}
              alt="Profile Preview"
              className="max-h-[85vh] max-w-[90vw] rounded-2xl object-cover shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
