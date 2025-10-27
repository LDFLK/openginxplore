import { useState } from "react";
import {
  Typography,
  Avatar,
  Box,
  Button,
  ButtonBase,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useThemeContext } from "../../../themeContext";
import utils from "../../../utils/utils";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PersonIcon from "@mui/icons-material/Person";
import personDetails from "../../../assets/personImages.json";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaAngleLeft } from "react-icons/fa6";
import PersonHistoryTimeline from "../components/PersonHistoryTimeline";
import ShareLinkButton from "../../../components/ShareLinkButton";

const PersonProfile = () => {
  const { colors } = useThemeContext();
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

  const tabOptions = ["history"];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: colors.backgroundPrimary,
        width: "100%",
        minHeight: { xs: "100vh", sm: "100vh" },
        px: { xs: 6, sm: 14, md: 36 },
        py: { xs: 4, sm: 6 },
      }}
    >
      {state.mode === "back" ? (
        <ButtonBase
          onClick={() => navigate(-1)}
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            mb: 2,
            width: 100,
            color: colors.textPrimary,
          }}
        >
          <FaAngleLeft />
          <Typography
            variant="h8"
            sx={{
              fontFamily: "Poppins",
              color: colors.textPrimary,
              textTransform: "none",
              ml: 1,
            }}
          >
            Back
          </Typography>
        </ButtonBase>
      ) : (
        <ButtonBase
          onClick={() => navigate('/')}
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            mb: 2,
            width: 200,
            color: colors.textPrimary,
          }}
        >
          <FaAngleLeft />
          <Typography
            variant="h8"
            sx={{
              fontFamily: "Poppins",
              color: colors.textPrimary,
              textTransform: "none",
            }}
          >
            Go to XploreGov
          </Typography>
        </ButtonBase>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          my: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: "Poppins",
            fontWeight: 600,
            color: colors.textPrimary,
          }}
        >
          Person profile
        </Typography>

        <ShareLinkButton />
      </Box>

      {/* --- Person Card --- */}
      <Box
        sx={{
          width: { xs: "100%", sm: "fit-content", md: "fit-content" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          backgroundColor: colors.backgroundWhite,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          gap: { xs: 2, sm: 3 },
          my: 3,
        }}
      >
        {/* Avatar */}
        <Avatar
          src={imageUrl}
          alt={selectedPerson?.name}
          sx={{
            width: { xs: 70, sm: 90, md: 100 },
            height: { xs: 70, sm: 90, md: 100 },
            bgcolor: colors.textMuted2,
            fontSize: { xs: 18, sm: 22, md: 24 },
            flexShrink: 0,
          }}
        >
          {personName.charAt(0).toUpperCase() || "?"}
        </Avatar>

        {/* Info */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            flex: 1,
            width: "100%",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              color: colors.textPrimary,
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
              wordBreak: "break-word",
            }}
          >
            {utils.extractNameFromProtobuf(selectedPerson?.name || "Unknown")}
          </Typography>

          {/* Info Fields */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%",
            }}
          >
            {[
              {
                icon: <AccountBalanceIcon sx={{ fontSize: 18, color: colors.textMuted }} />,
                label: "Ministries Worked At",
                value: workedMinistries,
              },
              {
                icon: <PersonIcon sx={{ fontSize: 18, color: colors.textMuted }} />,
                label: "Worked as President",
                value: workedAsPresident,
              },
            ].map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: { xs: 2, sm: 3, lg: 20, md: 3 },
                  width: "100%",
                  maxWidth: { xs: "100%", sm: "400px" },
                }}
              >
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    color: colors.textMuted,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    color: colors.textPrimary,
                    textAlign: "right",
                    wordBreak: "break-word",
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>


      {/* --- Tabs (Elliptical Buttons) --- */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
          justifyContent: { xs: "center", sm: "flex-start" },
        }}
      >
        {tabOptions.map((tab) => {
          const label = tab.charAt(0).toUpperCase() + tab.slice(1);
          const isActive = activeTab === tab;

          return (
            <Button
              key={tab}
              variant={isActive ? "contained" : "outlined"}
              onClick={() => setActiveTab(tab)}
              sx={{
                textTransform: "none",
                borderRadius: "50px",
                px: { xs: 2, sm: 3 },
                py: 0.8,
                fontFamily: "poppins",
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                color: isActive ? colors.backgroundPrimary : colors.textPrimary,
                backgroundColor: isActive ? colors.textPrimary : "transparent",
                borderColor: colors.textPrimary,
                "&:hover": {
                  backgroundColor: isActive
                    ? colors.textPrimary
                    : `${colors.primary}10`,
                },
              }}
            >
              {label}
            </Button>
          );
        })}
      </Box>

      {/* --- Tab Panels --- */}
      {activeTab === "history" && (
        <PersonHistoryTimeline
          selectedPerson={selectedPerson}
          onTimelineUpdate={setTimelineData}
          presidentRelationDict={presidentRelationDict}
        />
      )}
    </Box>
  );
};

export default PersonProfile;
