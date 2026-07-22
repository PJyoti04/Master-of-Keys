import {
  BarChart3,
  History,
  KeyRound,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function DashboardSidebar({
  open,
  onClose,
  userInfo,
  userInitial,
  summary,
  onLogout,
}) {
  const location = useLocation();
  const nav = useNavigate();
  const itemClass = (active) =>
    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-orange-500/12 text-orange-400 ring-1 ring-orange-500/15" : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"}`;

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close dashboard menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 lg:z-[49] z-50 flex w-[280px] flex-col border-r border-white/[0.07] bg-[#1D2229]/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:inset-y-auto lg:h-[calc(100vh-82px)] lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="border-b border-white/[0.06] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative grid h-12 w-12 shrink-0 place-items-center border border-orange-500/20 rounded-2xl g-gradient-to-br from-orange-400 to-orange-600 text-sm font-black text-white shadow-lg shadow-orange-500/20">
                <div>
                  {userInfo?.profileAvatar ? (
                    <img
                      src={userInfo.profileAvatar}
                      alt={userInfo.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    userInitial || "P"
                  )}
                </div>

                <span className="absolute bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#1D2229] bg-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">
                  {userInfo?.username || "Player"}
                </p>
                <p className="truncate text-[10px] text-zinc-500">
                  {userInfo?.email}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl text-zinc-400 hover:bg-white/[0.05] hover:text-white lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/[0.05] bg-[#181C22] p-3">
              <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">
                Practice
              </p>
              <p className="mt-1 text-lg font-black text-white">
                {summary.practiceSessions || 0}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.05] bg-[#181C22] p-3">
              <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">
                Rooms
              </p>
              <p className="mt-1 text-lg font-black text-white">
                {summary.multiplayerRooms || 0}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
            Workspace
          </p>
          <a
            href="#overview"
            onClick={onClose}
            className={itemClass(location.pathname === "/dashboard" && (location.hash === "" || location.hash === "#overview"))}
          >
            <BarChart3 size={18} />
            Overview
          </a>
          <a
            href="#session-history"
            onClick={onClose}
            className={itemClass(location.hash === "#session-history")}
          >
            <History size={18} />
            Session history
          </a>
          <Link
            to="/reset-password"
            // onClick={nav('/reset-password')}
            className={itemClass(location.pathname.includes("reset-password"))}
          >
            <KeyRound size={18} />
            Reset password
          </Link>

          <div className="mt-5 rounded-2xl border border-orange-500/15 bg-gradient-to-br from-orange-500/10 to-transparent p-4">
            <div className="flex items-center gap-2 text-orange-400">
              <Sparkles size={16} />
              <span className="text-xs font-semibold">Keep improving</span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-zinc-500">
              Small daily sessions build speed, accuracy, and consistency.
            </p>
          </div>
        </nav>

        <div className="border-t border-white/[0.06] p-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/[0.07] px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/15"
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

export default DashboardSidebar;
