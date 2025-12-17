import React, { useEffect, useState } from "react";
import DepartmentHistoryTimeline from "../components/DepartmentHistoryTimeline";
import { useThemeContext } from "../../../context/themeContext";
import utils from "../../../utils/utils";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import InfoTooltip from "../../../components/InfoToolTip";
import ShareLinkButton from "../../../components/ShareLinkButton";
import { ChevronLeft } from "lucide-react";

export default function DepartmentProfile() {
  const { departmentId } = useParams();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const { allDepartmentData } = useSelector((state) => state.allDepartmentData);

  useEffect(() => {
    if (allDepartmentData && departmentId) {
      setSelectedDepartment(allDepartmentData[departmentId]);
    }
  }, [departmentId, allDepartmentData]);

  const { colors } = useThemeContext();
  return (
    <div className="px-3 py-6 md:px-12 md:py-8 lg:px-18 xl:px-24 2xl:px-36 w-full bg-background-dark min-h-screen">
      <div className="w-full flex justify-between items-center">
        {state.from && state.from !== "" ? (
        <button
          onClick={() => navigate(state.from)}
          className="flex items-centertext-primary cursor-pointer"
        >
          <ChevronLeft className="text-primary" />
          <p className="text-primary">Back</p>
        </button>
      ) : (
        <button
          onClick={() => navigate("/")}
          className="flex items-center mb-2 text-primary cursor-pointer"
        >
          <ChevronLeft className="text-primary" />
          <p className="text-primary">Go to OpenGINXplore</p>
        </button>
      )}
          <ShareLinkButton />
      </div>

      <div className="flex items-center justify-center w-full mt-6 text-primary">
        <p className="text-xl font-semibold">
          {selectedDepartment &&
            utils.extractNameFromProtobuf(selectedDepartment.name)}
        </p>

      </div>
      <div className="flex justify-center">
        <p className="border border-border text-accent font-semibold px-4 py-3 bg-background mt-4 rounded-full">
          Department History Timeline{" "}
          <InfoTooltip
            message="Ministers the department was under throughout the history"
            iconColor={colors.textPrimary}
            iconSize={14}
            placement="right"
          />
        </p>
      </div>

      {/* Timeline */}
      <DepartmentHistoryTimeline selectedDepartment={selectedDepartment} />
    </div>
  );
}
