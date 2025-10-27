import { useState } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  IconButton,
  Drawer,
} from "@mui/material";
import ModernView from "./modernView";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import { Switch, FormControlLabel } from "@mui/material";
import { useThemeContext } from "../themeContext";
import { useBadgeContext } from "../components/badgeContext";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useSelector } from "react-redux";
import ShareLinkButton from "./ShareLinkButton";

function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    showMinistryBadge,
    setShowMinistryBadge,
    showPersonBadge,
    setShowPersonBadge,
  } = useBadgeContext();

  const { selectedPresident } = useSelector((state) => state.presidency);

  const { isDark, toggleTheme, colors } = useThemeContext();


  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: colors.backgroundPrimary,
      }}
    >
      {/* View Buttons */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: colors.backgroundPrimary,
          position: "relative",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            px: 5,
            py: 2,
            border: "none",
            justifyContent: "flex-end", // align to right
            alignItems: "center",
            position: "absolute",
            top: 10,
            right: 0, // align stack to right
            width: "auto", // fit content
            zIndex: 1000,
          }}
        >
          <ShareLinkButton />
          <Button
            onClick={() => setDrawerOpen(true)}
            startIcon={<SettingsIcon />}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              fontWeight: 500,
              color: colors.textPrimary,
              border: `1px solid ${colors.textPrimary}33`,
              borderRadius: "10px",
              px: 2,
              py: 1,
              cursor: "pointer",
              "&:hover": {
                backgroundColor: `${colors.primary}22`,
              },
            }}
          >
            Settings
          </Button>
        </Stack>
      </Box>

      {/* Drawer for settings */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 250,
            backgroundColor: colors.backgroundPrimary,
            color: colors.textPrimary,
            p: 2,
          },
        }}
      >
        <Stack spacing={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography fontWeight={600} fontSize={18}>
              Settings
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon sx={{ color: colors.textPrimary }} />
            </IconButton>
          </Box>
          <Accordion
            disableGutters
            sx={{
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "12px",
              boxShadow: "none",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: colors.textPrimary }} />}
              aria-controls="badge-settings-content"
              id="badge-settings-header"
              sx={{
                color: colors.textPrimary,
                fontWeight: 500,
                fontFamily: "poppins",
                fontSize: 16,
                p: 0,
                minHeight: "36px",
                display: "flex",
                alignItems: "center",
                "& .MuiAccordionSummary-content": {
                  margin: 0,
                },
                "& .MuiAccordionSummary-expandIconWrapper": {
                  marginRight: 1,
                },
              }}
            >
              Badge Visibility
            </AccordionSummary>

            <AccordionDetails>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      color={colors.green}
                      checked={showMinistryBadge}
                      onChange={() => setShowMinistryBadge((prev) => !prev)}
                      sx={{
                        "& .MuiSwitch-thumb": {
                          background: colors.green,
                        },
                        "& .MuiSwitch-track": {
                          background: showMinistryBadge
                            ? `${colors.green}`
                            : `${colors.green}99`,
                        },
                      }}
                    />
                  }
                  label={showMinistryBadge ? "Ministry" : "Ministry"}
                  labelPlacement="start"
                  sx={{
                    color: colors.textPrimary,
                    justifyContent: "space-between",
                    mx: 0,
                    "& .MuiFormControlLabel-label": {
                      fontWeight: 500,
                      fontFamily: "poppins",
                    },
                  }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      color={colors.purple}
                      checked={showPersonBadge}
                      onChange={() => setShowPersonBadge((prev) => !prev)}
                      sx={{
                        "& .MuiSwitch-thumb": {
                          background: colors.purple,
                        },
                        "& .MuiSwitch-track": {
                          background: showPersonBadge
                            ? colors.purple
                            : `${colors.purple}99`,
                        },
                      }}
                    />
                  }
                  label={showPersonBadge ? "Minister" : "Minister"}
                  labelPlacement="start"
                  sx={{
                    color: colors.textPrimary,
                    justifyContent: "space-between",
                    mx: 0,
                    "& .MuiFormControlLabel-label": {
                      fontWeight: 500,
                      fontFamily: "poppins",
                    },
                  }}
                />
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Drawer>

      <ModernView />
    </Box>
  );
}

export default Navbar;
