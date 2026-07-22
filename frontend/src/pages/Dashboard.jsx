import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  Flame,
  Gauge,
  Gamepad2,
  KeyRound,
  Keyboard,
  Menu,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { toast } from "react-toastify";
import "../App.css";

import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import StatCard from "../components/dashboard/StatCard";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import ActivityHeatmap from "../components/dashboard/ActivityHeatmap";
import SessionHistory from "../components/dashboard/SessionHistory";
import SessionDetailsModal from "../components/dashboard/SessionDetailsModal";

const DEFAULT_SUMMARY = {
  totalSessions: 0,
  practiceSessions: 0,
  multiplayerRooms: 0,
  averageWpm: 0,
  bestWpm: 0,
  averageAccuracy: 0,
  totalTypingMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
};

function Dashboard() {
  const { fetchUser, userInfo, userInitial } = useContext(AuthContext);

  const navigate = useNavigate();

  const [summary, setSummary] = useState(DEFAULT_SUMMARY);

  const [chartData, setChartData] = useState([]);

  const [activityData, setActivityData] = useState([]);

  const [sessions, setSessions] = useState([]);

  const [activeTab, setActiveTab] = useState("practice");

  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(false);

  const [selectedSession, setSelectedSession] = useState(null);

  const [sessionDetails, setSessionDetails] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const [loadingSessions, setLoadingSessions] = useState(false);

  const [loadingDetails, setLoadingDetails] = useState(false);

  const currentYear = new Date().getFullYear();

  const fetchDashboardOverview = useCallback(async () => {
    try {
      const response = await api.get(
        `/user/dashboard/overview?year=${currentYear}`,
      );

      setSummary({
        ...DEFAULT_SUMMARY,
        ...(response.data?.summary || {}),
      });

      setChartData(
        Array.isArray(response.data?.performance)
          ? response.data.performance
          : [],
      );

      setActivityData(
        Array.isArray(response.data?.activity) ? response.data.activity : [],
      );
    } catch (error) {
      console.error("Dashboard overview error:", error);

      toast.error(
        error.response?.data?.message || "Unable to load dashboard overview.",
      );
    } finally {
      setLoadingDashboard(false);
    }
  }, [currentYear]);

  const fetchSessions = useCallback(
    async ({ type = activeTab, requestedPage = 1, append = false } = {}) => {
      try {
        setLoadingSessions(true);

        const response = await api.get(`/user/dashboard/sessions`, {
          params: {
            type,
            page: requestedPage,
            limit: 10,
          },
        });

        const newSessions = Array.isArray(response.data?.sessions)
          ? response.data.sessions
          : [];

        setSessions((previousSessions) =>
          append ? [...previousSessions, ...newSessions] : newSessions,
        );

        setPage(Number(response.data?.page) || requestedPage);

        setHasMore(Boolean(response.data?.hasMore));
      } catch (error) {
        console.error("Session history error:", error);

        toast.error(
          error.response?.data?.message || "Unable to load session history.",
        );
      } finally {
        setLoadingSessions(false);
      }
    },
    [activeTab],
  );

  useEffect(() => {
    fetchDashboardOverview();
  }, [fetchDashboardOverview]);

  useEffect(() => {
    setSessions([]);
    setPage(1);
    setHasMore(false);

    fetchSessions({
      type: activeTab,
      requestedPage: 1,
      append: false,
    });
  }, [activeTab, fetchSessions]);

  const handleTabChange = (nextTab) => {
    if (nextTab !== "practice" && nextTab !== "rooms") {
      return;
    }

    setActiveTab(nextTab);
  };

  const handleLoadMore = () => {
    if (loadingSessions || !hasMore) {
      return;
    }

    fetchSessions({
      type: activeTab,
      requestedPage: page + 1,
      append: true,
    });
  };

  const handleSessionClick = async (session) => {
    if (!session?.id || !session?.type) {
      return;
    }

    try {
      setSelectedSession(session);
      setSessionDetails(null);
      setLoadingDetails(true);

      const endpoint =
        session.type === "room"
          ? `/user/dashboard/rooms/${session.id}`
          : `/user/dashboard/practice/${session.id}`;

      const response = await api.get(endpoint);

      setSessionDetails(response.data);
    } catch (error) {
      console.error("Session details error:", error);

      setSelectedSession(null);

      toast.error(
        error.response?.data?.message || "Unable to load session details.",
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetailsModal = () => {
    setSelectedSession(null);
    setSessionDetails(null);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");

      await fetchUser();

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);

      toast.error(error.response?.data?.message || "Unable to log out.");
    }
  };

  const formattedTypingTime = useMemo(() => {
    const totalMinutes = Number(summary.totalTypingMinutes) || 0;

    if (totalMinutes < 60) {
      return `${Math.round(totalMinutes)}m`;
    }

    const hours = Math.floor(totalMinutes / 60);

    const minutes = Math.round(totalMinutes % 60);

    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }, [summary.totalTypingMinutes]);

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#181C22] text-white lg:h-[calc(100dvh-90px)] lg:overflow-hidden border-t border-orange-500/20">
      <DashboardSidebar
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userInfo={userInfo}
        userInitial={userInitial}
        summary={summary}
        onLogout={handleLogout}
      />

      <div id="overview" className="lg:pl-[280px] lg:flex lg:flex-col lg:h-full">
        <header className="sticky top-0 z-30 shrink-0 border-b border-white/[0.06] bg-[#181C22]/90 px-3 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#20252D] text-zinc-300 lg:hidden"
                aria-label="Open dashboard menu"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-400">
                  Player dashboard
                </p>

                <h1 className="truncate text-lg font-black tracking-[-0.03em] sm:text-2xl">
                  Welcome back, {userInfo?.username || "Player"}
                </h1>
              </div>
            </div>

            {/* <Link
              to="reset-password"
              className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-[#20252D] px-3 py-2.5 text-xs font-semibold text-zinc-400 transition hover:border-orange-500/20 hover:text-white sm:inline-flex"
            >
              <KeyRound size={15} />
              Security
            </Link> */}
          </div>
        </header>

        <main className="scrollbar-hidden mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-6 sm:py-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-8">
          <section className="relative mb-5 overflow-hidden rounded-[26px] border border-white/[0.07] bg-gradient-to-br from-[#252B34] via-[#20252D] to-[#1C2128] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-orange-500/[0.11] blur-[90px]" />
            <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-xl font-black text-white shadow-xl shadow-orange-500/20 sm:h-20 sm:w-20">
                  {userInfo?.profileAvatar ? (
                    <img
                      src={userInfo.profileAvatar}
                      alt={userInfo.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    userInitial || "P"
                  )}
                  <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-[#20252D] bg-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-orange-400 ring-1 ring-orange-500/15">
                      <Sparkles size={11} />
                      Player profile
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[9px] font-semibold text-amber-400 ring-1 ring-amber-500/15">
                      <Flame size={11} />
                      {summary.currentStreak} day streak
                    </span>
                  </div>
                  <h2 className="mt-3 truncate text-2xl font-black tracking-[-0.05em] sm:text-3xl">
                    {userInfo?.username || "Player"}
                  </h2>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500 sm:text-sm">
                    Track every practice session, multiplayer result, streak,
                    and performance trend from one place.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Link
                  to="/practice"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-orange-500/15 transition hover:bg-orange-600"
                >
                  <Keyboard size={16} />
                  Practice
                </Link>
                <Link
                  to="/multiplayer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-black/15 px-4 py-3 text-xs font-semibold text-zinc-300 transition hover:border-violet-500/20 hover:text-white"
                >
                  <Gamepad2 size={16} />
                  Multiplayer
                </Link>
              </div>
            </div>
          </section>

          <section className="mb-5">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
              <StatCard
                label="Total sessions"
                value={summary.totalSessions}
                icon={Activity}
                loading={loadingDashboard}
                helper="Practice + rooms"
              />

              <StatCard
                label="Best speed"
                value={`${Math.round(summary.bestWpm)} WPM`}
                icon={Trophy}
                loading={loadingDashboard}
                accent="amber"
                helper="Personal record"
              />

              <StatCard
                label="Average speed"
                value={`${Math.round(summary.averageWpm)} WPM`}
                icon={Gauge}
                loading={loadingDashboard}
                helper="Across all runs"
              />

              <StatCard
                label="Accuracy"
                value={`${Math.round(summary.averageAccuracy)}%`}
                icon={Target}
                loading={loadingDashboard}
                accent="emerald"
                helper="Average precision"
              />

              <StatCard
                label="Typing time"
                value={formattedTypingTime}
                icon={Keyboard}
                loading={loadingDashboard}
                helper="Recorded activity"
              />

              <StatCard
                label="Rooms played"
                value={summary.multiplayerRooms}
                icon={Gamepad2}
                loading={loadingDashboard}
                accent="purple"
                helper="Competitive races"
              />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)]">
            <PerformanceChart data={chartData} loading={loadingDashboard} />

            <div className="rounded-2xl border border-white/[0.07] bg-[#20252D] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-400">
                    Activity
                  </p>

                  <h2 className="mt-1 text-lg font-bold">Typing consistency</h2>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-zinc-500">Longest streak</p>

                  <p className="text-sm font-semibold">
                    {summary.longestStreak} days
                  </p>
                </div>
              </div>

              <ActivityHeatmap
                activity={activityData}
                year={currentYear}
                loading={loadingDashboard}
              />
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-white/[0.07] bg-[#20252D] p-3 sm:mt-6 sm:p-5">
            <SessionHistory
              sessions={sessions}
              activeTab={activeTab}
              loading={loadingSessions}
              hasMore={hasMore}
              onTabChange={handleTabChange}
              onLoadMore={handleLoadMore}
              onSessionClick={handleSessionClick}
            />
          </section>
          <section className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              to="/reset-password"
              className="group flex items-center justify-between rounded-2xl border border-white/[0.07] bg-[#20252D] p-4 transition hover:border-orange-500/20"
            >
              <div>
                <p className="text-sm font-semibold text-white">
                  Account security
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Change your password through OTP verification.
                </p>
              </div>
              <ArrowUpRight
                size={18}
                className="text-zinc-700 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-orange-400"
              />
            </Link>
            <Link
              to="/practice"
              className="group flex items-center justify-between rounded-2xl border border-orange-500/15 bg-orange-500/[0.06] p-4 transition hover:bg-orange-500/[0.09]"
            >
              <div>
                <p className="text-sm font-semibold text-white">
                  Start another session
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Turn today into another active day.
                </p>
              </div>
              <ArrowUpRight
                size={18}
                className="text-orange-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </section>
        </main>
      </div>

      <SessionDetailsModal
        open={Boolean(selectedSession)}
        selectedSession={selectedSession}
        details={sessionDetails}
        loading={loadingDetails}
        onClose={closeDetailsModal}
      />

    </div>
  );
}

export default Dashboard;
