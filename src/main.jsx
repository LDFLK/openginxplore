import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./store/store";
import { ThemeProvider as CustomThemeProvider } from "./context/themeContext.jsx";
import { BadgeProvider } from "./context/badgeContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <CustomThemeProvider>
      <BadgeProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </BadgeProvider>
    </CustomThemeProvider>
  </Provider>
);
