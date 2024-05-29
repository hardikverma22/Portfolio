import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "src/index.css";
import {ThemeProvider} from "./contexts/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
