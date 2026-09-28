import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

// One line of a drill-down hierarchy breadcrumb (e.g. Ministry -> Department -> Body).
// Renders a title, with optional badge pill(s) underneath (linked if `badge.to` is given).
// `badge` accepts either a single badge object or an array of them (e.g. multiple ministers).
const HierarchyEntry = ({
  title,
  titleColor,
  titleFontWeight = 400,
  badge,
}) => {
  const badges = (Array.isArray(badge) ? badge : badge ? [badge] : []).filter(
    (b) => b?.label
  );

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

      {badges.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {badges.map((b, idx) =>
            b.to ? (
              <Link
                key={b.to || idx}
                to={b.to}
                state={b.state}
                style={{ textDecoration: "none" }}
                onClick={(e) => e.stopPropagation()}
              >
                <Box
                  sx={{
                    backgroundColor: b.color,
                    color: "#fff",
                    fontSize: { xs: "0.6rem", md: "0.9rem" },
                    borderRadius: "12px",
                    px: 1.5,
                    py: 0.7,
                    fontFamily: "Poppins",
                    display: "inline-flex",
                    alignItems: "center",
                    lineHeight: 1,
                    mt: 0.2,
                    cursor: "pointer",
                    "&:hover": { opacity: 0.9 },
                  }}
                >
                  {b.label}
                </Box>
              </Link>
            ) : (
              <Box
                key={b.label + idx}
                sx={{
                  backgroundColor: b.mutedColor || b.color,
                  color: "#fff",
                  fontSize: { xs: "0.6rem", md: "0.9rem" },
                  borderRadius: "12px",
                  px: 1.5,
                  py: 0.7,
                  fontFamily: "Poppins",
                  display: "inline-flex",
                  alignItems: "center",
                  lineHeight: 1,
                  mt: 0.2,
                }}
              >
                {b.label}
              </Box>
            )
          )}
        </Box>
      )}
    </Box>
  );
};

export default HierarchyEntry;
