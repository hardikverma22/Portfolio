import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "src/index.css";
import {ThemeProvider} from "./contexts/ThemeContextProvider";
import {
  ActiveIndexContext,
  ActiveIndexContextProvider,
} from "src/contexts/ActiveIndexContextProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ActiveIndexContextProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </ActiveIndexContextProvider>
);
