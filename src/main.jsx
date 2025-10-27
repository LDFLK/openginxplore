import App from "./App.jsx";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store/store";

import { ThemeProvider as CustomThemeProvider } from "./themeContext.jsx";
import { ThemeProvider as MUIThemeProvider, createTheme } from "@mui/material/styles";
import { BadgeProvider } from "./components/badgeContext.jsx";

const theme = createTheme({
  palette: {
    mode: "light", // or "dark"
    background: {
      default: "#ffffff",
    },
    text: {
      primary: "#000000",
    },
    primary: {
      main: "#1976d2",
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    body1: {
      fontWeight: 400,
      fontSize: "1rem",
    },
  },
  // components: {
  //   MuiSelect: {
  //     styleOverrides: {
  //       // select: {
  //       //   padding: "12px 15px !important", // aligns value with label
  //       // },
  //     },
  //   },
  //   MuiInputLabel: {
  //     styleOverrides: {
  //       root: {
  //         transform: "translate(12px, 12px) scale(1)", // default position
  //         "&.MuiInputLabel-shrink": {
  //           transform: "translate(12px, -10px) scale(0.85)", // floating position
  //         },
  //         "&.Mui-focused": {
  //           color: "#3d3b3bff", // focused label color
  //         },
  //       },
  //     },
  //   },
  //   MuiPaper: {
  //     styleOverrides: {
  //       root: {
  //         borderRadius: 8, // dropdown menu border radius
  //         boxShadow: 'none',
  //       },
  //     },
  //   },
  // }
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
      <CustomThemeProvider>
        <MUIThemeProvider theme={theme}>
          <BadgeProvider>
            <App />
          </BadgeProvider>
        </MUIThemeProvider>
      </CustomThemeProvider>
    </Provider>
);
