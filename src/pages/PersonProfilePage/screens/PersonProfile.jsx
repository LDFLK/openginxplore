import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PersonHistoryTimeline from "../components/PersonHistoryTimeline";
import PersonQualifications from "../components/PersonQualifications";
import ShareLinkButton from "../../../components/ShareLinkButton";
import {
  ChevronLeft,
  ImageOff,
  Calendar,
  Briefcase,
  BookOpen,
  Phone,
  Mail,
  Building2,
  Crown,
  Cake
} from "lucide-react";
import InfoTooltip from "../../../components/InfoToolTip";
import { usePersonProfile } from "../../../hooks/usePersonProfile";
import { usePersonHistory } from "../../../hooks/usePersonHistory";

const fieldConfig = [
  { key: "date_of_birth", label: "Date of Birth", icon: Cake },
  { key: "profession", label: "Profession", icon: Briefcase },
  { key: "age", label: "Age", icon: Calendar },
  { key: "religion", label: "Religion", icon: BookOpen },
  { key: "phone_number", label: "Phone Number", icon: Phone },
  { key: "email", label: "Email", icon: Mail },
];

const PersonProfile = () => {
  const { personId } = useParams();
  const imageStorageBaseUrl = window?.configs?.imageStorageBaseUrl ?? "";
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const [activeTab, setActiveTab] = useState("history");


  const { data: personProfile, isLoading: isLoadingPersonProfile, error } = usePersonProfile(personId);
  const { data: personHistory } = usePersonHistory(personId);

  const workedMinistries = personHistory?.ministries_worked_at || 0;
  const workedAsPresident = personHistory?.worked_as_president || 0;

  const isQualificationsDisabled =
    !personProfile?.education_qualifications &&
    !personProfile?.professional_qualifications;

  useEffect(() => {
    if (isQualificationsDisabled && activeTab === "qualifications") {
      setActiveTab("history");
    }
  }, [isQualificationsDisabled, activeTab]);


  const validFields = fieldConfig.filter(
    ({ key }) =>
      personProfile?.[key] &&
      personProfile?.[key].toString().trim() !== ""
  );

  if (isLoadingPersonProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !personProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Profile Not Available
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            We couldn't load this person's profile. It may not exist or something went wrong.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:opacity-90 transition hover:cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-12 md:py-10 lg:px-20 xl:px-28 2xl:px-40 w-full bg-background min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() =>
            state.from && state.from !== ""
              ? navigate(state.from, {
                state: {
                  from: state.callback === true && state.callbackLink,
                },
              })
              : navigate("/")
          }
          className="flex items-center gap-1 text-accent hover:text-accent/70 cursor-pointer transition-colors"
        >
          <ChevronLeft size={18} />
          <span className="text-sm font-medium">
            {state.from && state.from !== "" ? "Back" : "Go to OpenGINXplore"}
          </span>
        </button>

        <ShareLinkButton />
      </div>

      {/* Person Card */}
      <div className="w-full mb-10">
        <div className="flex flex-col sm:flex-row gap-6 md:gap-10 items-start">

          {/* Avatar — small, clean, no ring */}
          <div className="flex-shrink-0">
            <div className="w-28 h-28 md:w-35 md:h-35 rounded-full bg-gray-100 shadow-sm" style={{ overflow: "hidden", flexShrink: 0 }}>
              {personProfile.image_url != null ? (
                <img
                  className="block"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  src={imageStorageBaseUrl + personProfile.image_url}
                  alt={personProfile?.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="text-gray-300 w-8 h-8" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-medium dark:text-white text-gray-900 mb-1 tracking-tight">
              {personProfile?.name || "Unknown"}
            </h1>

            {personProfile?.political_party && (
              <p className="text-sm text-gray-400 mb-6">
                Last Elected Party - {personProfile.political_party}
              </p>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
              {validFields.length > 0 ? (
                validFields.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-md bg-gray-50 dark:bg-transparent dark:border-gray-700 border border-gray-100 flex items-center justify-center">
                      <Icon size={14} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                        {label}
                      </p>
                      <p className="text-sm text-gray-800 dark:text-white">
                        {personProfile?.[key]}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex items-center justify-start py-1 text-center text-xs text-accent italic">
                  Data is being collected...
                </div>
              )}

              {/* Ministries Worked At */}
              {workedMinistries > 0 && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-md bg-gray-50 bg-gray-50 dark:bg-transparent dark:border-gray-700 border border-gray-100 flex items-center justify-center">
                    <Building2 size={14} className="text-accent" />
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5 ">
                      Ministries Worked At
                      <InfoTooltip
                        message="This may include ministers inherited from the previous administration before the president released their own cabinet."
                        placement="right"
                        iconColor="#aaa"
                        iconSize={11}
                      />
                    </p>
                    <p className="text-sm text-gray-800 dark:text-white">{workedMinistries}</p>
                  </div>
                </div>
              )}

              {/* Worked as President */}
              {workedAsPresident > 0 && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-md bg-gray-50 bg-gray-50 dark:bg-transparent dark:border-gray-700 border border-gray-100 flex items-center justify-center">
                    <Crown size={14} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                      Worked as President
                    </p>
                    <p className="text-sm text-gray-800 dark:text-white">{workedAsPresident}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-800 mb-8" />
      {/* Tabs + Content */}
      <div className="w-full">
        {/* Tab Row */}
        <div className="flex gap-1 mb-6 border-b border-gray-100 dark:border-gray-800">
          {[
            { key: "history", label: "Portfolios Held", disabled: false },
            {
              key: "qualifications",
              label: "Qualifications",
              disabled: isQualificationsDisabled,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => !tab.disabled && setActiveTab(tab.key)}
              disabled={tab.disabled}
              className={`px-4 py-2.5 text-sm font-semibold capitalize transition-all border-b-2 -mb-px
        ${tab.disabled
                  ? "text-gray-300 cursor-not-allowed border-transparent"
                  : activeTab === tab.key
                    ? "border-accent text-accent"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:cursor-pointer"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px] max-h-[680px] overflow-y-auto">
          {activeTab === "history" && (
            <PersonHistoryTimeline
              personId={personId}
            />
          )}
          {activeTab === "qualifications" && !isQualificationsDisabled && (
            <PersonQualifications
              education={personProfile?.education_qualifications}
              professionalQualifications={
                personProfile?.professional_qualifications
              }
            />
          )}
        </div>
        {/* Source Attribution */}
        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400">
            Profile data source:{" "}
            <a
              href="https://www.parliament.lk/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent transition-colors underline underline-offset-2"
            >
              www.parliament.lk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonProfile;
