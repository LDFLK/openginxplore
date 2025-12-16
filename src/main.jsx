import App from "./App.jsx";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store/store";
import { ThemeProvider as CustomThemeProvider } from "./context/themeContext.jsx";
import { BadgeProvider } from "./context/badgeContext.jsx";
import "./index.css"; // 

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
      <CustomThemeProvider>
          <BadgeProvider>
            <App />
          </BadgeProvider>
      </CustomThemeProvider>
    </Provider>
);
