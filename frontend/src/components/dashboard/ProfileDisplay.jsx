import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

// Register the necessary components for Chart.js
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

const Dashboard = () => {
  const { fetchUser, userInfo, userInitial } = useContext(AuthContext);
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = async (skip = 0, limit = 10) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/user/dashboard?skip=${skip}&limit=${limit}`
      );
      const typingData = res.data;
      if (skip === 0) {
        setHistory(typingData);
      } else {
        setHistory((prev) => [...prev, ...typingData]);
      }
      if (typingData.length < limit) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout");
      await fetchUser();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Graph Data for WPM
  const data = {
    labels: history.map((item) => item.date),
    datasets: [
      {
        label: "WPM",
        data: history.map((item) => item.wpm),
        fill: false,
        borderColor: "orange",
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="flex bg-[#181C22] text-slate-300 font-mono">
      {/* Sidebar */}
      <div
        className={`w-[35vh] min-w-64 h-screen rounded-lg bg-[#1f242a] sticky top-0 transform transition-transform duration-300 ease-in-out ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className="w-full text-xl text-right p-3 cursor-pointer hover:text-orange-500 absolute"
          onClick={() => setIsSidebarVisible(false)}
          style={{ userSelect: "none" }}
        >
          {"<"}
        </div>
        <div className="flex gap-4 items-center justify-center bg-[#080a0c00] p-[38px_0px_5px_0px] ">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold cursor-pointer">
            <p>{userInitial}</p>
          </div>
          <p className="font-bold">{userInfo.username}</p>
        </div>
        <div className="space-y-4 p-6 h-[calc(100vh-72px)] relative flex flex-col items-center ">
          <Link to="reset_password">
            <button
              className="w-full text-white hover:text-[orange] hover:underline"
            >
              Reset Password
            </button>
          </Link>

          <button className="w-full text-white hover:text-[orange] hover:underline">
            History
          </button>
          <button
            onClick={handleLogout}
            className="w-full rounded-md hover:bg-[#ffa60025] p-[12px] text-md text-center left-0 text-white hover:text-[orange] bottom-[20vh] absolute "
          >
            Logout
          </button>
        </div>
      </div>

      {/* Toggle Button when sidebar is hidden */}
      {!isSidebarVisible && (
        <button
          onClick={() => setIsSidebarVisible(true)}
          className="fixed top-30 left-2 z-50 w-8 h-8 text-xl rounded bg-orange-500 text-white flex items-center justify-center cursor-pointer hover:bg-orange-600"
          aria-label="Show sidebar"
        >
          {">"}
        </button>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 p-8 overflow-y-scroll scrollbar-hidden transition-all duration-300 ease-in-out ${
          isSidebarVisible ? "" : "w-full"
        }`}
      >
        {/* Profile Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome, {userInfo.username}!
          </h2>
          <p className="text-gray-400">{userInfo.email}</p>
        </div>

        {/* WPM Graph Section */}
        <div className="bg-[#1f242a] p-6 rounded-lg shadow-lg mb-8 max-w-[90vw] max-h-[400px]">
          <h3 className="text-xl font-bold text-white mb-4">
            Your WPM Progress
          </h3>
          <div className="h-[250px]">
            <Line data={data} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* History Section */}
        <div className="bg-[#1f242a] p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">History</h3>
          <ul className="space-y-4 text-gray-300">
            {history.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>{item.date}</span>
                <span>{item.wpm} WPM</span>
              </li>
            ))}
          </ul>
          {hasMore && (
            <button
              onClick={() => fetchData(history.length, 10)}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Load More
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
