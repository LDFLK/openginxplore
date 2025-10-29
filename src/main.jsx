import App from "./App.jsx";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store/store";
import { ThemeProvider as CustomThemeProvider } from "./themeContext.jsx";
import { BadgeProvider } from "./components/badgeContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
      <CustomThemeProvider>
          <BadgeProvider>
            <App />
          </BadgeProvider>
      </CustomThemeProvider>
    </Provider>
);
