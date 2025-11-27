import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import { SenderProvider } from "./context/SenderContext";
import { FuelSettlementProvider } from "./context/FuelSettlementContext";
import "./index.css";

ReactDOM.render(
  <SenderProvider>
    <FuelSettlementProvider>
      <App />
    </FuelSettlementProvider>
  </SenderProvider>,
  document.getElementById("root"),
);