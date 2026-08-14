import {Link} from "react-router-dom";
import icon3d from "@propertyManagementModule/assets/images/public/project/icon-3d.svg";
import iconGallery from "@propertyManagementModule/assets/images/public/project/icon-gallery.svg";
import iconFinance from "@propertyManagementModule/assets/images/public/project/icon-finance.svg";
import {
    openProjectFigmaPath,
    type OpenProjectFigmaView,
} from "@propertyManagementModule/clients/client/public/openProjectFigma/openProjectFigmaPaths.ts";

type OpenProjectFigmaActionsProps = {
    projectId: string;
    active: OpenProjectFigmaView;
    tone?: "onDark" | "onLight";
};

const ACTIONS: {view: Exclude<OpenProjectFigmaView, "grid">; icon: string; label: string}[] = [
    {view: "3d", icon: icon3d, label: "3D"},
    {view: "gallery", icon: iconGallery, label: "Gallery"},
    {view: "finance", icon: iconFinance, label: "Finance"},
];

function OpenProjectFigmaActions({projectId, active, tone = "onLight"}: OpenProjectFigmaActionsProps) {
    const inactiveClass =
        tone === "onDark"
            ? "bg-[rgba(255,255,255,0.2)] backdrop-blur-[7px]"
            : "bg-[rgba(0,0,0,0.2)] backdrop-blur-[7px]";

    return (
        <div className="flex items-center gap-4" data-node-id="467:898">
            {ACTIONS.map((action) => {
                const isActive = action.view === active;
                return (
                    <Link
                        key={action.view}
                        to={openProjectFigmaPath(action.view, projectId)}
                        aria-label={action.label}
                        aria-current={isActive ? "page" : undefined}
                        className={`relative flex size-16 shrink-0 items-center justify-center rounded-[5px] ${
                            isActive ? "bg-pronix-blue" : inactiveClass
                        }`}
                    >
                        <img alt="" aria-hidden className="size-11" src={action.icon} />
                    </Link>
                );
            })}
        </div>
    );
}

export default OpenProjectFigmaActions;
