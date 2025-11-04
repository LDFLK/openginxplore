import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import utils from "../../../utils/utils";
import personDetails from "../../../assets/personImages.json";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PersonHistoryTimeline from "../components/PersonHistoryTimeline";
import ShareLinkButton from "../../../components/ShareLinkButton";
import { ChevronLeft, ImageOff, Landmark, UserRound } from "lucide-react";

const PersonProfile = () => {
  const { personId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const [activeTab, setActiveTab] = useState("history");
  const [timelineData, setTimelineData] = useState([]);
  const presidentRelationDict = useSelector(
    (state) => state.presidency.presidentRelationDict
  );
  const { allPerson } = useSelector((state) => state.allPerson);

  const selectedPerson = allPerson[personId];

  const workedMinistries = timelineData.length || 0;
  const workedAsPresident = Object.values(presidentRelationDict).filter(
    (rel) => rel.id === selectedPerson?.id
  ).length;

  const personName = utils.extractNameFromProtobuf(
    selectedPerson?.name || "Unknown"
  );

  const matchingPresident = personDetails.find(
    (p) => p.presidentName === personName
  );

  const imageUrl = matchingPresident ? matchingPresident.imageUrl : null;

  const tabOptions = ["History"];

  useEffect(() => {
    console.log(state.from == "");
  }, [state]);

  return (
    <div className="px-3 py-6 md:px-12 md:py-8 lg:px-18 xl:px-24 2xl:px-36 w-full bg-background-dark min-h-screen">
      {state.from !== "" ? (
        <button
          onClick={() => navigate(state.from,{ state: {from: state.callback == true && state.callbackLink} })}
          className="flex items-center mb-2 text-primary cursor-pointer"
        >
          <ChevronLeft className="text-primary"/>
          <p className="text-primary">Back</p>
        </button>
      ) : (
        <button
          onClick={() => navigate("/")}
          className="flex items-center mb-2 text-primary cursor-pointer"
        >
          <ChevronLeft className="text-primary"/>
          <p className="text-primary">Go to XploreGov</p>
        </button>
      )}
      <div className="flex justify-end items-center my-2">
        <ShareLinkButton />
      </div>

      {/* --- Person Card --- */}
      <div className="w-full flex justify-center">
        <div className="w-full md:w-2/3 lg:w-1/2 flex items-center gap-4 justify-center rounded-md border border-border bg-background my-6 p-5">
          <div className="flex-shrink-0 rounded-full w-24 h-24 md:w-28 md:h-28 mb-2 shadow-md border border-border flex justify-center items-center">
            {imageUrl != null ? (
              <img
                className="rounded-full object-cover"
                src={imageUrl}
                alt={selectedPerson?.name}
                style={{ aspectRatio: "1 / 1" }}
              />
            ) : (
              <ImageOff className="text-primary/25 w-6 h-6" />
            )}
          </div>

          <div className="flex flex-col gap-1 w-full text-center md:text-left">
            <p className="font-semibold text-primary text-xl mb-3 mt-3 md:mt-5">
              {utils.extractNameFromProtobuf(selectedPerson?.name || "Unknown")}
            </p>

            {[
              {
                icon: <Landmark className="text-primary/50" />,
                label: "Ministries Worked At",
                value: workedMinistries,
              },
              {
                icon: <UserRound className="text-primary/50" />,
                label: "Worked as President",
                value: workedAsPresident,
              },
            ]
            .filter((item) => !(item.label === "Worked as President" && (!item.value || item.value === 0)))
            .map((item, idx) => (
              <Box
                key={idx}
                className="flex justify-between flex-wrap gap-2 mb-3 w-full text-sm sm:text-base"
              >
                <p className="flex items-center gap-2 font-normal text-primary/75">
                  {item.icon}
                  {item.label}
                </p>
                <p className="text-primary/75">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        {tabOptions.map((tab) => {
          const label = tab.charAt(0).toUpperCase() + tab.slice(1);
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              className={`rounded-full ${
                isActive
                  ? "border-2 border-border hover:bg-accent"
                  : "bg-background border border-border"
              } cursor-pointer px-6 py-3 bg-background font-semibold text-accent`}
              onClick={() => setActiveTab(tab)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === "history" && (
        <PersonHistoryTimeline
          selectedPerson={selectedPerson}
          onTimelineUpdate={setTimelineData}
          presidentRelationDict={presidentRelationDict}
        />
      )}
    </div>
  );
};

export default PersonProfile;
