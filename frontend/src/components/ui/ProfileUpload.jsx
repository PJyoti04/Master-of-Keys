import { useContext, useRef, useState } from "react";
import { Pencil, Eye, Upload } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function ProfileUpload() {
  const { user, userInitial } = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
  };

  const handleUpdatePhoto = () => {
    setShowMenu(false);
    fileInputRef.current?.click();
  };

  const handleViewPhoto = () => {
    setShowMenu(false);

    if (image) {
      setShowPreview(true);
    }
  };

  return (
    <>
      <div className="relative w-fit">
        {/* Avatar */}
        <div
          onClick={() => setShowMenu((prev) => !prev)}
          className="relative h-28 w-28 cursor-pointer overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100 shadow-md"
        >
          {image ? (
            <img
              src={image}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-gray-500">
              {userInitial}
            </div>
          )}
        </div>

        {/* Edit Button */}
        <button
          onClick={() => setShowMenu((prev) => !prev)}
          className="absolute -right-0 bottom-1 flex -translate-x-1/6 translate-y-1/6 items-center gap-2 rounded-full bg-orange-500 px-1 py-1 text-xs font-medium text-white shadow-lg transition hover:bg-orange-600"
        >
          <Pencil size={11} />
          Edit
        </button>

        {/* Dropdown */}
        {showMenu && (
          <div className="absolute left-1/2 top-full z-20 mt-8 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            <button
              onClick={handleViewPhoto}
              disabled={!image}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition
                ${
                  image
                    ? "hover:bg-gray-100 text-gray-700"
                    : "cursor-not-allowed text-gray-400"
                }`}
            >
              <Eye size={18} />
              View Profile Picture
            </button>

            <button
              onClick={handleUpdatePhoto}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-100"
            >
              <Upload size={18} />
              Update Profile Picture
            </button>
          </div>
        )}

        {/* Hidden Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Preview Modal */}
      {showPreview && image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-bold shadow"
            >
              ×
            </button>

            <img
              src={image}
              alt="Profile Preview"
              className="max-h-[80vh] max-w-[90vw] rounded-2xl object-cover shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
