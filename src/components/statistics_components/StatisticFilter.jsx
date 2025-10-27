"use client"
import { Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material"
import { useThemeContext } from "../../themeContext"

const menuProps = {
  PaperProps: {
    sx: {
      border: "1px solid #BABABA",
      borderRadius: 2,
    },
  },
}

export default function StatisticsFilters({
  selection,
  setSelection,
  selectedCategory,
  availableYears,
  availableDepartments,
  availableStats,
  onShowData, // Added callback for show data button
}) {
  const current = selection[selectedCategory]
  const { colors, isDark } = useThemeContext()

  // normalize availableStats to menu items (supports array of strings or [{id,name}])
  const renderStatMenuItems = (stats) => {
    if (!stats || stats.length === 0) return null
    return stats.map((s) => {
      if (typeof s === "string") {
        return (
          <MenuItem key={s} value={s}>
            {s}
          </MenuItem>
        )
      }
      // object expected shape { id, name }
      return (
        <MenuItem key={s.id} value={s.id}>
          {s.name}
        </MenuItem>
      )
    })
  }

  const canShowData = selectedCategory === "Department" && current?.dept && current?.stat

  return (
    <Box p="4px">
      <Typography
        variant="h4"
        align="left"
        sx={{
          fontWeight: 300,
          my: 2,
          color: colors.textPrimary,
          letterSpacing: "0.5px",
        }}
      >
        Data Explorer
      </Typography>
      <Paper
        sx={{
          borderRadius: 3,
          maxWidth: "100%",
          margin: "0 auto",
          backgroundColor: colors.backgroundWhite,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: `1px solid ${colors.textMuted}20`,
          padding: 3,
        }}
      >
        {/* Dropdowns */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            alignItems: "stretch",
            mb: canShowData ? 3 : 0, // Add margin bottom when show data button is visible
          }}
        >
          {selectedCategory === "Department" && (
            <>
              <FormControl fullWidth size="medium">
                <InputLabel
                  sx={{
                    color: colors.textMuted,
                    fontSize: "0.9rem",
                    "&.Mui-focused": {
                      color: colors.textPrimary,
                    },
                  }}
                >
                  Department
                </InputLabel>
                <Select
                  value={current.dept || ""}
                  onChange={(e) =>
                    setSelection((prev) => ({
                      ...prev,
                      Department: { ...prev.Department, dept: e.target.value },
                    }))
                  }
                  label="Department"
                  MenuProps={menuProps}
                  sx={{
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: `${colors.textMuted}40`,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: `${colors.textMuted}60`,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textPrimary,
                      borderWidth: 1,
                    },
                    "& .MuiSelect-select": {
                      color: colors.textPrimary,
                      fontSize: "0.9rem",
                    },
                  }}
                >
                  {availableDepartments.length > 0 ? (
                    availableDepartments.map((d) => (
                      <MenuItem key={d} value={d}>
                        {d}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No departments available</MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth size="medium">
                <InputLabel
                  sx={{
                    color: colors.textMuted,
                    fontSize: "0.9rem",
                    "&.Mui-focused": {
                      color: colors.textPrimary,
                    },
                  }}
                >
                  Metric
                </InputLabel>
                <Select
                  value={current.stat || ""}
                  onChange={(e) =>
                    setSelection((prev) => ({
                      ...prev,
                      Department: { ...prev.Department, stat: e.target.value },
                    }))
                  }
                  label="Metric"
                  MenuProps={menuProps}
                  sx={{
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: `${colors.textMuted}40`,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: `${colors.textMuted}60`,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.textPrimary,
                      borderWidth: 1,
                    },
                    "& .MuiSelect-select": {
                      color: colors.textPrimary,
                      fontSize: "0.9rem",
                    },
                  }}
                >
                  {availableStats && availableStats.length > 0 ? (
                    renderStatMenuItems(availableStats)
                  ) : (
                    <MenuItem disabled>Select a department first</MenuItem>
                  )}
                </Select>
              </FormControl>
            </>
          )}
        </Box>

        {canShowData && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => onShowData && onShowData(current)}
              sx={{
                backgroundColor: colors.textPrimary,
                color: colors.backgroundWhite,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontSize: "0.9rem",
                fontWeight: 500,
                textTransform: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                "&:hover": {
                  backgroundColor: colors.textMuted,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              Show Data
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  )
}
