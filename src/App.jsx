import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Error404 from "./pages/ErrorBoundaries/screens/404Error";
import { useThemeContext } from "./context/themeContext";
import DataLoadingAnimatedComponent from "./pages/SplashPage/screens/dataLoadingAnimatedComponent";
import DocsPage from "./pages/DocsPage/screens/DocsPage";
import OfflineBanner from "./components/OfflineBanner";
import { usePageTracking } from "./hooks/usePageTracking";
import HomePage from "./pages/HomePage/screens/HomePage";
import PersonProfile from "./pages/PersonProfilePage/screens/PersonProfile";
import DepartmentProfile from "./pages/DepartmentPage/screens/DepartmentProfile";
import Organization from "./pages/OrganizationPage/screens/Organization";
import DataPage from "./pages/DataPage/screens/DataPage";
import SearchPage from "./pages/SearchPage/screens/SearchPage";
import MeetingsTracker from "./pages/MeetingsTracker/screens/MeetingsTracker";

const AppRoutes = () => {
  usePageTracking();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/organization?view=cabinet-structure" replace />} />

      {/* Data loading layout: fetches all data, shows splash, then renders child via <Outlet /> */}
      <Route element={<DataLoadingAnimatedComponent />}>

        {/* App shell layout: sidebar + header, renders tab content via <Outlet /> */}
        <Route element={<HomePage />}>
          <Route path="/organization" element={<Organization />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/meetingsTracker" element={<MeetingsTracker />} />
        </Route>

        <Route path="/person-profile/:personId" element={<PersonProfile />} />
        <Route path="/department-profile/:departmentId" element={<DepartmentProfile />} />
      </Route>

      <Route path="/docs" element={<DocsPage />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

const App = () => {
  const { isDark } = useThemeContext();

  return (
    <div className={isDark ? "dark" : ""}>
      <OfflineBanner />
      <Router>
        <AppRoutes />
      </Router>
    </div>
  );
}

export default App;