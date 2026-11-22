import "./index.css";
import DyeusApp from "./dyeusApp.tsx";
import {createRoot} from "react-dom/client";
import {env} from "@coreModule/helpers/environment/env.ts";
import {showPlaceholderForMissingPublicMedia} from "@coreModule/helpers/media/publicMediaPlaceholder.ts";

void env;

// Media held back from visitors (flagged for review, D177) shows a placeholder, not a broken image.
showPlaceholderForMissingPublicMedia();
createRoot(document.getElementById("root")!).render(<DyeusApp />);
