import { createRoot } from "react-dom/client";
import "./index.css";
import router from "./routes/Router.jsx"
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";


createRoot(document.getElementById("root")).render(
  <AuthProvider>
  <RouterProvider router={router} />
  </AuthProvider>
);
