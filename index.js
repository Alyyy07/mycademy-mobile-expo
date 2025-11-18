import { LogBox } from "react-native";

LogBox.ignoreLogs([
  "MemoizedTNodeRenderer: Support for defaultProps",
  "TNodeChildrenRenderer: Support for defaultProps",
  "TRenderEngineProvider: Support for defaultProps",
  "IMGElement: Support for defaultProps",
  "Support for defaultProps"
]);

const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("Support for defaultProps")
  ) {
    return;
  }
  originalWarn(...args);
};

import App from "./App"; // baru import App
import { registerRootComponent } from "expo";

registerRootComponent(App);
