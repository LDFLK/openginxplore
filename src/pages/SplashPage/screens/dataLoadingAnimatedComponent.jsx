import { useState, useEffect } from "react";
import api from "../../../services/services";
import useNetworkStatus from "../../../hooks/useNetworkStatus";
import usePresidents from "../../../hooks/usePresidents";
import { setAllDepartmentData } from "../../../store/allDepartmentData";
import { setSelectedPresident } from "../../../store/presidencySlice";
import { useDispatch, useSelector } from "react-redux";
import { OFFLINE_ERROR } from "../../../utils/network";
import PersonProfile from "../../PersonProfilePage/screens/PersonProfile";
import Error500 from "../../ErrorBoundaries/screens/500Error";
import DepartmentProfile from "../../DepartmentPage/screens/DepartmentProfile";
import SplashPage from "../components/splash_page";
import HomePage from "../../HomePage/screens/HomePage";

const listToDict = (list) =>
  list.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

export default function DataLoadingAnimatedComponent({ mode }) {
  const [showServerError, setShowServerError] = useState(false);
  const [departmentsLoaded, setDepartmentsLoaded] = useState(false);
  const [splashDelayDone, setSplashDelayDone] = useState(false);

  const dispatch = useDispatch();
  const isOnline = useNetworkStatus();

  const selectedPresident = useSelector((s) => s.presidency.selectedPresident);

  // Presidents and gazette dates now come from React Query; it is the same
  // cached query the rest of the app reads, so nothing is fetched twice.
  const {
    data: presidentData,
    isPending: presidentsPending,
    isError: presidentsError,
  } = usePresidents();

  const presidentList = presidentData?.presidentList;
  const presidentsReady = !!presidentList?.length;

  const totalSteps = 2;
  const completedSteps = (presidentsPending ? 0 : 1) + (departmentsLoaded ? 1 : 0);
  const progress = Math.round((completedSteps / totalSteps) * 100);

  // Departments are still Redux-backed (read by DepartmentProfile), so they
  // stay an imperative fetch until that slice gets its own hook.
  useEffect(() => {
    if (departmentsLoaded || !isOnline) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await api.fetchAllDepartments();
        const departmentList = await response.json();
        if (cancelled) return;
        dispatch(setAllDepartmentData(listToDict(departmentList.body)));
        setDepartmentsLoaded(true);
      } catch (e) {
        if (cancelled) return;
        if (e.message !== OFFLINE_ERROR) setShowServerError(true);
        console.log(`Error fetching department data : ${e.message}`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [departmentsLoaded, isOnline, dispatch]);

  // Going offline is not a server error, and the query will fail while offline.
  useEffect(() => {
    if (!isOnline) {
      setShowServerError(false);
      return;
    }
    if (presidentsError) setShowServerError(true);
  }, [presidentsError, isOnline]);

  // Default to the sitting president, unless a selection already exists.
  useEffect(() => {
    if (selectedPresident || !presidentsReady) return;
    dispatch(setSelectedPresident(presidentList[presidentList.length - 1]));
  }, [selectedPresident, presidentsReady, presidentList, dispatch]);

  const dataReady = presidentsReady && departmentsLoaded;

  // Hold the splash for a beat after the data lands, as before.
  useEffect(() => {
    if (!dataReady) return;
    const timer = setTimeout(() => setSplashDelayDone(true), 1000);
    return () => clearTimeout(timer);
  }, [dataReady]);

  const loading =
    isOnline && !showServerError && !(dataReady && splashDelayDone);

  return (
    <>
      {loading ? (
        <SplashPage progress={progress} />
      ) : showServerError ? (
        <Error500 />
      ) : (
        <>
          {presidentsReady && mode === "orgchart" ? (
            <HomePage />
          ) : presidentsReady && mode === "person-profile" ? (
            <PersonProfile />
          ) : (
            presidentsReady && mode === "department-profile" && (
              <DepartmentProfile />
            )
          )}
        </>
      )}
    </>
  );
}
