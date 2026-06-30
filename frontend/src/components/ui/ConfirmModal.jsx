import { AlertTriangle } from "lucide-react";

function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "bg-red-500 hover:bg-red-600",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-[#20252D] border border-white/10 shadow-2xl overflow-hidden">

        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="h-11 w-11 rounded-xl bg-red-500/15 flex items-center justify-center">
            <AlertTriangle className="text-red-400" size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              {title}
            </h2>

            <p className="text-sm text-zinc-400">
              Confirmation Required
            </p>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-zinc-300 leading-7">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-3 px-6 py-5 border-t border-white/10">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-[#181C22] border border-white/10 hover:border-orange-500 text-zinc-300 hover:text-white transition"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-white transition ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ConfirmModal;