import {
  Box, Grid, Typography, Alert, AlertTitle, TextField, Select, MenuItem, FormControl, InputLabel, Button, Card, DialogContent, Avatar,
} from "@mui/material";

import { useEffect, useRef, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

import { useThemeContext } from "../../../context/themeContext";
import useUrlParamState from "../../../hooks/singleSharingURL";
import { useActivePortfolioList } from "../../../hooks/useActivePortfolioList";
import { usePrimeMinister } from "../../../hooks/usePrimeMinister";

import MinistryCard from "./MinistryCard";
import MinistryViewModeToggleButton from "../../../components/ministryViewModeToggleButton";
import GraphComponent from "./graphComponent";
import PersonsTab from "./PersonsTab";
import DepartmentTab from "./DepartmentTab";
import InfoTooltip from "../../../components/InfoToolTip";

import { ClipLoader } from "react-spinners";

import InputAdornment from "@mui/material/InputAdornment";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";

import {
  Search as SearchIcon,
  AccountBalance as AccountBalanceIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
  Apartment as ApartmentIcon,
  People as PeopleIcon
} from "@mui/icons-material";


const MinistryCardGrid = () => {
  const { selectedDate, selectedPresident } = useSelector(
    (state) => state.presidency
  );
  const [searchText, setSearchText] = useUrlParamState("filterByName", "");
  const [filterType, setFilterType] = useUrlParamState("filterByType", "all");
  const [viewMode, setViewMode] = useUrlParamState("viewMode", "Grid");
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState("departments");
  const [selectedCard, setSelectedCard] = useState(null);
  const { colors } = useThemeContext();
  const location = useLocation();

  const { data, isLoading, error } = useActivePortfolioList(
    selectedPresident?.id,
    selectedDate?.date
  );

  const activeMinistryList = data?.portfolioList || [];

  const activeMinistriesCount = data?.activeMinistries || 0;
  const newMinistriesCount = data?.newMinistries || 0;
  const newMinistersCount = data?.newMinisters || 0;
  const ministriesUnderPresident = data?.ministriesUnderPresident || 0;


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ministryId = params.get("ministry");

    if (!ministryId || activeMinistryList.length === 0) {
      setSelectedCard(null);
      setActiveStep(0);
      return;
    }

    const matchedCard = activeMinistryList.find(
      (card) => String(card.id) === String(ministryId)
    );

    if (matchedCard) {
      setSelectedCard(matchedCard);
      setActiveStep(1);
    }
  }, [location.search, activeMinistryList, viewMode]);

  const {
    data: primeMinisterData,
    isLoading: pmIsLoading,
  } = usePrimeMinister(selectedDate?.date);

  const primeMinister = primeMinisterData?.body;

  const filteredMinistryList = useMemo(() => {
    if (!data?.portfolioList) return [];

    let result = data.portfolioList;

    switch (filterType) {
      case "newPerson":
        result = result.filter((m) => m.ministers?.[0]?.isNew);
        break;
      case "newMinistry":
        result = result.filter((m) => m.isNew);
        break;
      case "presidentAsMinister":
        result = result.filter((m) => m.ministers?.[0]?.isPresident);
        break;
      case "all":
      default:
        break;
    }

    if (searchText?.trim() !== "") {
      const normalizedSearchText = searchText.trim().toLowerCase();
      result = result.filter((m) =>
        m.name.toLowerCase().includes(normalizedSearchText)
      );
    }

    return result;
  }, [data?.portfolioList, filterType, searchText]);

  const handleChange = (event) => {
    setSearchText(event.target.value);
  };

  const steps = [
    {
      label: "Ministries",
      description: `All active ministries on this date`,
    },
    {
      label: "Departments & People",
      description: "All departments under this ministry",
    },
  ];
  // Custom icon component
  const StepIcon = ({ label }) => {
    let IconComponent = null;

    if (label === "Ministries") IconComponent = ApartmentIcon;
    if (label === "Departments & People") IconComponent = PeopleIcon;

    if (!IconComponent) return null;

    return (
      <Box
        sx={{
          width: 35,
          height: 35,
          borderRadius: "50%",
          backgroundColor: selectedPresident.themeColorLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconComponent sx={{ color: "#fff" }} />
      </Box>
    );
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => {
      const newStep = prevActiveStep - 1;

      if (newStep === 0) {
        const params = new URLSearchParams(window.location.search);
        params.delete("ministry");

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
      }

      return newStep;
    });
  };

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.delete("ministry");
    setActiveStep(0);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  }, [selectedDate]);

  const handleCardClick = async (card) => {
    // dispatch(setSelectedMinistry(card.id));
    handleNext();
    setSelectedCard(card);

    const params = new URLSearchParams(window.location.search);
    params.set("ministry", card.id);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  return (
    <Box
      sx={{
        px: 2,
        mt: -2,
        my: 2,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr",
            md: "1fr",
            lg: "43% 56%",
            xl: "43% 56%",
          },
          alignItems: "stretch",
          width: "100%",
          gap: { xs: 2, sm: 2, md: 2, lg: 4, xl: 3 },
          mb: 3,
          py: 2,
          px: 3,
          backgroundColor: colors.backgroundWhite,
          borderRadius: 2,
          border: "1px solid",
          borderColor: colors.border,
        }}
      >
        {/* Highlights Box*/}
        <Box
          sx={{
            gridColumn: {
              xs: "1 / -1",
              sm: "1 / -1",
              md: "1 / -1",
              lg: "1 / 2",
            },
            display: "flex",
            flexDirection: "column",
            alignItems: "left",
            justifyContent: "center",
            backgroundColor: colors.backgroundWhite,
            overflow: "hidden",
            py: 1.5,
            borderRight: { lg: `1px solid ${colors.timelineColor}` },
            borderBottom: {
              xs: `1px solid ${colors.timelineColor}`,
              lg: "none",
            },
          }}
        >
          <Box sx={{ mt: -0.5 }}>
            {primeMinister &&
              selectedPresident ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  ml: 2,
                }}
              >
                <Avatar
                  src={primeMinister?.imageUrl}
                  alt={primeMinister?.name}
                  sx={{
                    width: 55,
                    height: 55,
                    backgroundColor: colors.backgroundPrimary,
                  }}
                />
                <Box sx={{ display: "block", ml: 1 }}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: colors.white,
                      fontWeight: 500,
                      backgroundColor: `${selectedPresident.themeColorLight}99`,
                      py: 0.25,
                      px: 1,
                      borderRadius: 1,
                      width: "102px",
                      mb: 0.5,
                    }}
                  >
                    Prime Minister
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 400,
                        fontSize: 15,
                        fontFamily: "poppins",
                        color: colors.textPrimary,
                        margin: 0,
                      }}
                    >
                      {primeMinister?.name}
                    </Typography>
                    {primeMinister?.isNew && (
                      <Box
                        sx={{
                          border: `1px solid ${colors.green}`,
                          color: colors.green,
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          borderRadius: "4px",
                          px: 1,
                          py: 0.5,
                          fontFamily: "poppins",
                          display: "inline-flex",
                          alignItems: "center",
                          lineHeight: 1,
                        }}
                      >
                        NEW
                      </Box>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 14, color: colors.textMuted }}>
                    {primeMinister?.term}
                  </Typography>
                  <Button
                    component={Link}
                    to={`/person-profile/${primeMinister?.id}`}
                    state={{
                      mode: "back",
                      from: location.pathname + location.search,
                    }}
                    disableRipple
                    disableElevation
                    sx={{
                      p: 0,
                      minWidth: "auto",
                      backgroundColor: "transparent",
                      textTransform: "none",
                      textAlign: "left",
                      "&:hover": { backgroundColor: "transparent" },
                    }}
                  >
                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: 13,
                        color: "#6491DA",
                        transition: "color 0.3s, text-decoration 0.3s",
                        ":hover": {
                          textDecoration: "underline",
                          color: selectedPresident.themeColorLight,
                        },
                      }}
                    >
                      View Profile
                    </Typography>
                  </Button>
                </Box>
              </Box>
            ) : !primeMinister &&
              !pmIsLoading ? (
              <Typography
                sx={{
                  fontStyle: "italic",
                  color: colors.textMuted,
                  textAlign: "left",
                }}
              >
                No Prime Minister appointed on this date.
              </Typography>
            ) : (
              pmIsLoading && (
                <Typography
                  sx={{
                    fontStyle: "italic",
                    color: colors.textMuted,
                    textAlign: "left",
                  }}
                >
                  Loading Prime Minister data...
                </Typography>
              )
            )}
          </Box>
        </Box>

        <Card
          sx={{
            gridColumn: {
              xs: "1 / -1",
              sm: "1 / -1",
              md: "1 / -1",
              lg: "2 / 3",
            },
            backgroundColor: colors.backgroundWhite,
            boxShadow: "none",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            mb: { xs: 2, md: 0 },
            borderRadius: 2,
          }}
        >
          {!isLoading ? (
            <Box
              sx={{
                width: "90%",
                px: 1,
                display: "flex",
                flexDirection: "column",
                gap: 0.4,
              }}
            >
              {/* Active Ministries */}
              {activeMinistriesCount > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <AccountBalanceIcon
                    sx={{ color: colors.textMuted, fontSize: 18 }}
                  />
                  <Typography
                    sx={{
                      flex: 1,
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      color: colors.textMuted,
                      fontSize: 15,
                    }}
                  >
                    Active Ministries{" "}
                    <InfoTooltip
                      message="Number of ministry portfolios active on the selected date"
                      iconColor={colors.textPrimary}
                      iconSize={13}
                      placement="right"
                    />
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontSize: 17,
                      fontWeight: 500,
                      color: colors.textPrimary,
                    }}
                  >
                    {activeMinistriesCount}
                  </Typography>
                </Box>
              )}

              {/* New Ministries */}
              {newMinistriesCount > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <AccountBalanceIcon
                    sx={{ color: colors.textMuted, fontSize: 18 }}
                  />
                  <Typography
                    sx={{
                      flex: 1,
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      color: colors.textMuted,
                      fontSize: 15,
                    }}
                  >
                    New Ministries{" "}
                    <InfoTooltip
                      message="New ministry portfolios created on selected date"
                      iconColor={colors.textPrimary}
                      iconSize={13}
                      placement="right"
                    />
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontSize: 17,
                      fontWeight: 500,
                      color: colors.textPrimary,
                    }}
                  >
                    {newMinistriesCount}
                  </Typography>
                </Box>
              )}

              {/* New Ministers */}
              {newMinistersCount > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <PersonAddAlt1Icon
                    sx={{ color: colors.textMuted, fontSize: 18 }}
                  />
                  <Typography
                    sx={{
                      flex: 1,
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      color: colors.textMuted,
                      fontSize: 15,
                    }}
                  >
                    New Ministers{" "}
                    <InfoTooltip
                      message="New ministers assigned to portfolios on selected date"
                      iconColor={colors.textPrimary}
                      iconSize={13}
                      placement="right"
                    />
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontSize: 17,
                      fontWeight: 500,
                      color: colors.textPrimary,
                    }}
                  >
                    {newMinistersCount}
                  </Typography>
                </Box>
              )}

              {/* Ministries under president */}
              {ministriesUnderPresident > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <WorkspacePremiumIcon
                    sx={{ color: colors.textMuted, fontSize: 18 }}
                  />
                  <Typography
                    sx={{
                      flex: 1,
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      color: colors.textMuted,
                      fontSize: 15,
                    }}
                  >
                    Ministries under president{" "}
                    <InfoTooltip
                      message="The number of minister portfolios assigned to the president - if the president is newly elected and has not released a cabinet yet, all ministers from the prior cabinet are temporarily assigned to them."
                      iconColor={colors.textPrimary}
                      iconSize={13}
                      placement="right"
                    />
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontSize: 17,
                      fontWeight: 500,
                      color: colors.textPrimary,
                    }}
                  >
                    {ministriesUnderPresident}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Typography
              sx={{
                fontStyle: "italic",
                color: colors.textMuted,
                textAlign: "left",
              }}
            >
              Loading Highlights...
            </Typography>
          )}
        </Card>
      </Box>

      {/* Container for Active Ministries Section */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          py: 2,
          borderRadius: 2,
          backgroundColor: colors.backgroundWhite,
          border: "1px solid",
          borderColor: colors.border,
        }}
      >
        {/* Top Bar with Title + Search + Filter + ViewMode Toggle */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "flex-end",
            alignItems: { xs: "flex-end", sm: "center" },
            gap: 1, // reduced gap
            mb: 1,
            px: { xs: 2, sm: 3 }, // smaller padding on mobile
            pt: 2,
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              alignItems: "center",
              width: { xs: "100%", sm: "auto" },
              justifyContent: "flex-end",
            }}
          >
            {steps[activeStep]?.label !== "Departments & People" && (
              <>
                {/* Search Bar */}
                <Box
                  sx={{
                    flex: 1,
                    minWidth: { xs: "100%", sm: 200 },
                    maxWidth: { sm: 300 },
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Search ministries"
                    id="ministry-search"
                    onChange={handleChange}
                    value={searchText}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon sx={{ color: colors.textMuted, fontSize: 15 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      backgroundColor: colors.backgroundColor,
                      "& .MuiInputLabel-root": { color: colors.textMuted },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: colors.textMuted },
                        "&:hover fieldset": { borderColor: colors.textMuted },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.textMuted,
                        },
                        "& input:-webkit-autofill": {
                          WebkitBoxShadow: `0 0 0 1000px ${colors.backgroundColor} inset`,
                          WebkitTextFillColor: colors.textMuted,
                          transition: "background-color 5000s ease-in-out 0s",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: colors.textMuted,
                      },
                      "& .MuiInputBase-input": { color: colors.textMuted },
                    }}
                  />
                </Box>

                {/* Filter Dropdown */}
                <FormControl
                  size="small"
                  sx={{
                    minWidth: { xs: "100%", sm: 120 },
                    flexShrink: 0,
                  }}
                >
                  <InputLabel
                    sx={{
                      color: colors.textMuted,
                      fontSize: 13,
                      "&.Mui-focused": { color: colors.textMuted },
                    }}
                  >
                    Filter
                  </InputLabel>
                  <Select
                    value={filterType || ""}
                    label="Filter"
                    onChange={(e) => setFilterType(e.target.value)}
                    sx={{
                      backgroundColor: colors.backgroundColor,
                      color: colors.textMuted,
                      fontSize: 13,
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.textMuted },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: colors.textMuted },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: colors.textMuted },
                      "& .MuiSvgIcon-root": { color: colors.textMuted, fontSize: 18 },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: colors.backgroundPrimary,
                          "& .MuiMenuItem-root": { color: colors.textPrimary, fontSize: 13 },
                          "& .MuiMenuItem-root.Mui-selected": {
                            color: colors.textMuted,
                            backgroundColor: `${colors.backgroundColor} !important`,
                          },
                          "& .MuiMenuItem-root:hover": {
                            backgroundColor: `${colors.textMuted}10 !important`,
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="all">All Ministries</MenuItem>
                    <MenuItem value="newPerson">New Ministers Appointed</MenuItem>
                    <MenuItem value="newMinistry">New Ministries</MenuItem>
                    <MenuItem value="presidentAsMinister">President as Minister</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}

            {/* View Mode Toggle */}
            <MinistryViewModeToggleButton
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </Box>
        </Box>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "20vh",
            }}
          >
            <ClipLoader
              color={selectedPresident.themeColorLight}
              loading={isLoading}
              size={25}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                pl: viewMode == "Grid" ? 6.5 : 0,
              }}
            >
              {viewMode == "Grid" ? (
                <Stepper
                  activeStep={activeStep}
                  sx={{
                    width: "100%",
                    "& .MuiStepConnector-line": {
                      borderColor: colors.textMuted,
                    },
                  }}
                  orientation="vertical"
                >
                  {steps.map((step, index) => {
                    // Hide "Departments & People" step if it's not clickable
                    if (
                      step.label == "Departments & People" &&
                      activeStep != 1
                    ) {
                      return null;
                    }

                    return (
                      <Step key={step.label}>
                        <StepLabel
                          StepIconComponent={() => (
                            <StepIcon label={step.label} />
                          )}
                          onClick={
                            (activeStep != 0 &&
                              step.label == "Ministries" &&
                              selectedCard) ||
                              (activeStep == 1 &&
                                step.label == "Departments & People")
                              ? handleBack
                              : null
                          }
                          sx={{
                            fontWeight: 700,
                            cursor: "pointer",
                            "&:hover .MuiTypography-root": {
                              textDecoration: "underline",
                            },
                            "& .MuiStepIcon-root": {
                              fontSize: "2rem", // Increase icon size
                              color: selectedPresident.themeColorLight,
                              "&.Mui-active": {
                                color: selectedPresident.themeColorLight,
                              },
                              "&.Mui-completed": {
                                color: selectedPresident.themeColorLight,
                              },
                            },
                          }}
                        >
                          <Typography
                            component="span"
                            sx={{
                              color: colors.textPrimary,
                              fontWeight: "semibold",
                              fontSize: "1.1rem",
                              transition: "text-decoration 0.2s ease-in-out",
                            }}
                          >
                            {selectedCard &&
                              step.label == "Ministries" &&
                              activeStep !== 0
                              ? selectedCard.name
                              : step.label}
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          {step.label == "Ministries" ? (
                            <>
                              <Grid
                                mt={2}
                                position={"relative"}
                                container
                                justifyContent="center"
                                gap={1}
                                sx={{ width: "100%" }}
                              >
                                {filteredMinistryList &&
                                  filteredMinistryList.length > 0 ? (
                                  filteredMinistryList.map((card) => (
                                    <Grid
                                      key={card.id}
                                      sx={{
                                        display: "grid",
                                        flexBasis: {
                                          xs: "100%",
                                          sm: "48%",
                                          md: "31.5%",
                                          lg: "23.5%",
                                        },
                                        maxWidth: {
                                          xs: "100%",
                                          sm: "48%",
                                          md: "31.5%",
                                          lg: "23.5%",
                                        },
                                      }}
                                    >
                                      <MinistryCard
                                        card={card}
                                        onClick={() => handleCardClick(card)}
                                      />
                                    </Grid>
                                  ))
                                ) : !isLoading &&
                                  activeMinistryList &&
                                  activeMinistryList.length === 0 ? (
                                  <Box
                                    sx={{
                                      width: "100%",
                                      display: "flex",
                                      justifyContent: "center",
                                      marginTop: "15px",
                                    }}
                                  >
                                    <Alert
                                      severity="info"
                                      sx={{ backgroundColor: "transparent" }}
                                    >
                                      <AlertTitle
                                        sx={{
                                          fontFamily: "poppins",
                                          color: colors.textPrimary,
                                        }}
                                      >
                                        No ministries.
                                      </AlertTitle>
                                    </Alert>
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      width: "100%",
                                      display: "flex",
                                      justifyContent: "center",
                                      marginTop: "15px",
                                    }}
                                  >
                                    <Alert
                                      severity="info"
                                      sx={{ backgroundColor: "transparent" }}
                                    >
                                      <AlertTitle
                                        sx={{
                                          fontFamily: "poppins",
                                          color: colors.textPrimary,
                                        }}
                                      >
                                        No Search Result
                                      </AlertTitle>
                                    </Alert>
                                  </Box>
                                )}
                              </Grid>
                              {/* If filtering is happening, overlay a subtle loader
                              {filterLoading && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    mt: 2,
                                  }}
                                >
                                  <ClipLoader
                                    color={selectedPresident.themeColorLight}
                                    loading={filterLoading}
                                    size={18}
                                  />
                                </Box>
                              )} */}
                            </>
                          ) : (
                            step.label == "Departments & People" && (
                              <DialogContent
                                sx={{
                                  p: 4,
                                  borderRadius: "14px",
                                  mr: 4,
                                  mt: 2,
                                  display: "flex",
                                  flexDirection: "column",
                                  overflowY: "auto",
                                  scrollbarWidth: "none",
                                  backgroundColor: colors.backgroundDark,
                                  "&::-webkit-scrollbar": { display: "none" },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 2,
                                    mb: 4,
                                    justifyContent: {
                                      xs: "center",
                                      sm: "flex-start",
                                    },
                                  }}
                                >
                                  {["departments", "people"].map((tab) => {
                                    const label =
                                      tab.charAt(0).toUpperCase() +
                                      tab.slice(1);
                                    const isActive = tab == activeTab;
                                    return (
                                      <Button
                                        key={tab}
                                        variant={
                                          isActive ? "contained" : "outlined"
                                        }
                                        onClick={() => setActiveTab(tab)}
                                        sx={{
                                          textTransform: "none",
                                          borderRadius: "50px",
                                          px: { xs: 2, sm: 3 },
                                          py: 0.8,
                                          backgroundColor: isActive
                                            ? selectedPresident.themeColorLight
                                            : "none",
                                          borderColor:
                                            selectedPresident.themeColorLight,
                                          color: isActive
                                            ? colors.white
                                            : selectedPresident.themeColorLight,
                                          fontFamily: "poppins",
                                          fontSize: {
                                            xs: "0.8rem",
                                            sm: "0.9rem",
                                            md: "1rem",
                                          },
                                        }}
                                      >
                                        {label}
                                      </Button>
                                    );
                                  })}
                                </Box>
                                <Box sx={{ flexGrow: 1, mt: 2, width: "100%" }}>
                                  <>
                                    {selectedCard &&
                                      activeTab === "departments" && (
                                        <DepartmentTab
                                          selectedDate={
                                            selectedDate?.date || selectedDate
                                          }
                                          ministryId={selectedCard?.id}
                                        />
                                      )}
                                    {selectedCard && activeTab === "people" && (
                                      <PersonsTab
                                        selectedDate={
                                          selectedDate?.date || selectedDate
                                        }
                                      />
                                    )}
                                  </>
                                </Box>
                              </DialogContent>
                            )
                          )}
                        </StepContent>
                      </Step>
                    );
                  })}
                </Stepper>
              ) : (
                <GraphComponent
                  activeMinistries={filteredMinistryList}
                  filterType={filterType}
                />
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default MinistryCardGrid;
