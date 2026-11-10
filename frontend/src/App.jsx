import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import HomePage from "./Pages/HomePage/HomePage";
import AboutPage from "./Pages/AboutPage/AboutPage";
import "./App.css";
import Login from "./Pages/AuthPage/Login";
import Register from "./Pages/AuthPage/Register";
import UserProtectedWrapper from "./context/UserProtectedWrapper";
import LogoutPage from "./Pages/AuthPage/Logout";
import PageNotFound from "./Pages/PageNotFound/PageNotFound";
import ReportHistory from "./Pages/ReportHistory/ReportHistory";
import ResultPage from "./Pages/HomePage/ResultPage";

function AppLayout() {
  const { pathname } = useLocation();
  const isWorkspace =
    pathname === "/" || pathname.startsWith("/reportHistory/");

  return (
    <div className={`app-shell${isWorkspace ? " app-shell--workspace" : ""}`}>
      <div className="app-content">
        <Routes>
          <Route path="*" element={<PageNotFound />} />

          <Route
            path="/"
            element={
              <UserProtectedWrapper>
                <HomePage />
              </UserProtectedWrapper>
            }
          />
          <Route
            path="/about"
            element={
              <UserProtectedWrapper>
                <AboutPage />
              </UserProtectedWrapper>
            }
          />

          {/* -------------- auth route ---------------- */}
          <Route
            path="/reportHistory"
            element={
              <UserProtectedWrapper>
                <ReportHistory />
              </UserProtectedWrapper>
            }
          />
          <Route
            path="/reportHistory/:reportId"
            element={
              <UserProtectedWrapper>
                <ResultPage />
              </UserProtectedWrapper>
            }
          />

          {/* -------------- auth route ---------------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<LogoutPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
