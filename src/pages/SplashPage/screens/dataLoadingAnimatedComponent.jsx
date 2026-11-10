import { useState, useEffect, useRef } from "react";
import utils from "../../../utils/utils";
import useNetworkStatus from "../../../hooks/useNetworkStatus";
import { useBootstrapData } from "../../../hooks/useBootstrapData";
import { setAllMinistryData } from "../../../store/allMinistryData";
import { setAllDepartmentData } from "../../../store/allDepartmentData";
import presidentDetails from "../../../assets/personImages.json";
import { setAllPerson } from "../../../store/allPersonData";
import {
  setPresidentRelationDict,
  setPresidentDict,
  setSelectedPresident,
} from "../../../store/presidencySlice";
import { useDispatch, useSelector } from "react-redux";
import { OFFLINE_ERROR } from "../../../utils/network";
import { setGazetteDataClassic } from "../../../store/gazetteDate";
import PersonProfile from "../../PersonProfilePage/screens/PersonProfile";
import Error500 from "../../ErrorBoundaries/screens/500Error";
import DepartmentProfile from "../../DepartmentPage/screens/DepartmentProfile";
import SplashPage from "../components/splash_page";
import HomePage from "../../HomePage/screens/HomePage";

const TOTAL_STEPS = 4;
const MIN_SPLASH_MS = 1000;

const listToDict = (list = []) => {
  return list.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
};

export default function DataLoadingAnimatedComponent({ mode }) {
  const [showServerError, setShowServerError] = useState(false);
  const [minDelayElapsed, setMinDelayElapsed] = useState(false);
  const { presidentDict, selectedPresident } = useSelector(
    (state) => state.presidency
  );
  const dispatch = useDispatch();
  const isOnline = useNetworkStatus();

  const hasPresidentData = Object.keys(presidentDict).length !== 0;
  const {
    persons,
    ministries,
    departments,
    gazetteDates,
    isSettled,
    isError,
    error,
  } = useBootstrapData({ enabled: isOnline && !hasPresidentData });

  const appliedPersonsRef = useRef(null);
  const appliedMinistriesRef = useRef(null);
  const appliedDepartmentsRef = useRef(null);
  const appliedGazetteRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => setMinDelayElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isError) return;
    if (error?.message !== OFFLINE_ERROR) setShowServerError(true);
  }, [isError, error]);

  useEffect(() => {
    if (!persons.data || appliedPersonsRef.current === persons.data) return;
    appliedPersonsRef.current = persons.data;

    const { persons: personList, presidents } = persons.data;
    const personDict = listToDict(personList);
    dispatch(setAllPerson(personDict));

    const presidentResponse = [...presidents].sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime)
    );

    const presidentRelationDict = listToDict(
      presidentResponse.map((item) => ({
        ...item,
        id: item.relatedEntityId,
      }))
    );
    dispatch(setPresidentRelationDict(presidentRelationDict));

    const presidentDictInDetail = presidentResponse
      .map((p) => personDict[p.relatedEntityId])
      .filter(Boolean);

    const enrichedPresidents = presidentDictInDetail.map((president) => {
      const matchedDetail = presidentDetails.find((detail) =>
        detail.personName
          .toLowerCase()
          .includes(utils.extractNameFromProtobuf(president.name).toLowerCase())
      );

      return {
        ...president,
        imageUrl: matchedDetail?.imageUrl || null,
        themeColorLight: matchedDetail?.themeColorLight || null,
      };
    });

    dispatch(setPresidentDict(enrichedPresidents));

    if (!selectedPresident) {
      const selectedPre = enrichedPresidents[enrichedPresidents.length - 1];
      dispatch(setSelectedPresident(selectedPre));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persons.data]);

  useEffect(() => {
    if (!ministries.data || appliedMinistriesRef.current === ministries.data) {
      return;
    }
    appliedMinistriesRef.current = ministries.data;

    const stateDict = listToDict(ministries.data.state?.body);
    const cabinetDict = listToDict(ministries.data.cabinet?.body);

    dispatch(setAllMinistryData({ ...stateDict, ...cabinetDict }));
  }, [ministries.data, dispatch]);

  useEffect(() => {
    if (!departments.data || appliedDepartmentsRef.current === departments.data) {
      return;
    }
    appliedDepartmentsRef.current = departments.data;

    dispatch(setAllDepartmentData(listToDict(departments.data.body)));
  }, [departments.data, dispatch]);

  useEffect(() => {
    if (!gazetteDates.data || appliedGazetteRef.current === gazetteDates.data) {
      return;
    }
    appliedGazetteRef.current = gazetteDates.data;

    dispatch(setGazetteDataClassic(gazetteDates.data));
  }, [gazetteDates.data, dispatch]);

  const settledCount = [persons, ministries, departments, gazetteDates].filter(
    (query) => query.isSuccess || query.isError
  ).length;
  const progress = Math.round((settledCount / TOTAL_STEPS) * 100);
  const loading =
    isOnline &&
    !showServerError &&
    !hasPresidentData &&
    (!isSettled || !minDelayElapsed);

  return (
    <>
      {loading ? (
        <SplashPage progress={progress} />
      ) : showServerError ? (
        <Error500 />
      ) : (
        <>
          {Object.keys(presidentDict).length > 0 && mode === "orgchart" ? (
            <HomePage />
          ) : Object.keys(presidentDict).length > 0 &&
            mode === "person-profile" ? (
            <PersonProfile />
          ) : (
            Object.keys(presidentDict).length > 0 &&
            mode === "department-profile" && <DepartmentProfile />
          )}
        </>
      )}
    </>
  );
}
