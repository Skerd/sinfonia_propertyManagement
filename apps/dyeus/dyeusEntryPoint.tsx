import "./index.css";
import DyeusApp from "./dyeusApp.tsx";
import {createRoot} from "react-dom/client";
import {env} from "@coreModule/helpers/env.ts";

void env;

createRoot(document.getElementById("root")!).render(<DyeusApp />);
