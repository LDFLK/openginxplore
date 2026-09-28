import { Box } from "@mui/material";

// Short vertical line drawn between two HierarchyEntry levels to show they're nested.
const HierarchyConnector = ({ color }) => (
  <Box
    sx={{
      width: "2px",
      height: 16,
      ml: 2.2,
      backgroundColor: color,
    }}
  />
);

export default HierarchyConnector;
