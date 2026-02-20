import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Error404 from "./pages/ErrorBoundaries/screens/404Error";
import { useThemeContext } from "./context/themeContext";
import DataLoadingAnimatedComponent from "./pages/SplashPage/screens/dataLoadingAnimatedComponent";
import DocsPage from "./pages/DocsPage/screens/DocsPage";
import { usePageTracking } from "./hooks/usePageTracking";

const AppRoutes = () => {
  usePageTracking();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/organization" replace />} />
      <Route path="/person-profile/:personId" element={<DataLoadingAnimatedComponent mode="person-profile" />} />
      <Route path="/department-profile/:departmentId" element={<DataLoadingAnimatedComponent mode="department-profile" />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/:tab" element={<DataLoadingAnimatedComponent mode="orgchart" />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

const App = () => {
  const { isDark } = useThemeContext();

  return (
    <div className={isDark ? "dark" : ""}>
      <Router>
        <AppRoutes />
      </Router>
    </div>
  );
}

export default App