import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

// One line of a drill-down hierarchy breadcrumb (e.g. Ministry -> Department -> Body).
// Renders a title, with an optional badge pill underneath (linked if `badge.to` is given).
const HierarchyEntry = ({
  title,
  titleColor,
  titleFontWeight = 400,
  badge,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.5 }}>
      <Typography
        component="span"
        sx={{
          color: titleColor,
          fontWeight: titleFontWeight,
          fontSize: { xs: "0.8rem", md: "1.1rem" },
          transition: "text-decoration 0.2s ease-in-out",
        }}
      >
        {title}
      </Typography>

      {badge && (
        badge.to ? (
          <Link
            to={badge.to}
            state={badge.state}
            style={{ textDecoration: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              sx={{
                backgroundColor: badge.color,
                color: "#fff",
                fontSize: { xs: "0.6rem", md: "0.9rem" },
                borderRadius: "12px",
                px: 1.5,
                py: 0.7,
                fontFamily: "poppins",
                display: "inline-flex",
                alignItems: "center",
                lineHeight: 1,
                mt: 0.2,
                cursor: "pointer",
                "&:hover": { opacity: 0.9 },
              }}
            >
              {badge.label}
            </Box>
          </Link>
        ) : (
          <Box
            sx={{
              backgroundColor: badge.mutedColor || badge.color,
              color: "#fff",
              fontSize: { xs: "0.6rem", md: "0.9rem" },
              borderRadius: "12px",
              px: 1.5,
              py: 0.7,
              fontFamily: "poppins",
              display: "inline-flex",
              alignItems: "center",
              lineHeight: 1,
              mt: 0.2,
            }}
          >
            {badge.label}
          </Box>
        )
      )}
    </Box>
  );
};

export default HierarchyEntry;
