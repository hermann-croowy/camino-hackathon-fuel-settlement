import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import { SenderProvider } from "./context/SenderContext";
import { FuelSettlementProvider } from "./context/FuelSettlementContext";
import { ViewModeProvider } from "./context/ViewModeContext";
import "./index.css";

ReactDOM.render(
  <ViewModeProvider>
    <SenderProvider>
      <FuelSettlementProvider>
        <App />
      </FuelSettlementProvider>
    </SenderProvider>
  </ViewModeProvider>,
  document.getElementById("root"),
);