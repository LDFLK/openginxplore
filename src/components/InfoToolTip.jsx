import { Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import colors from "../assets/colors";

export default function InfoTooltip({
    message,
    placement = "top",
    iconColor = colors.textSearch,
    iconSize = 16 // px
}) {
    return (
        <Tooltip title={message} placement={placement} arrow>
            <IconButton sx={{ p: 0.1 }}>
                <InfoOutlinedIcon sx={{ fontSize: iconSize, color: iconColor }} />
            </IconButton>
        </Tooltip>
    );
}
