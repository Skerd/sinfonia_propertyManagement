import {Link} from "react-router-dom";
import {motion} from "motion/react";
import icon3d from "@propertyManagementModule/assets/images/public/project/icon-3d.svg";
import iconGallery from "@propertyManagementModule/assets/images/public/project/icon-gallery.svg";
import iconFinance from "@propertyManagementModule/assets/images/public/project/icon-finance.svg";
import {cn} from "@coreModule/components/lib/utils.ts";
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
            ? "bg-[rgba(255,255,255,0.2)] backdrop-blur-[7px] hover:bg-[rgba(255,255,255,0.32)]"
            : "bg-[rgba(0,0,0,0.2)] backdrop-blur-[7px] hover:bg-[rgba(0,0,0,0.3)]";

    return (
        <div className="flex items-center gap-2 sm:gap-4" data-node-id="467:898">
            {ACTIONS.map((action) => {
                const isActive = action.view === active;
                return (
                    <Link
                        key={action.view}
                        to={openProjectFigmaPath(action.view, projectId)}
                        aria-label={action.label}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                            "relative flex size-11 shrink-0 items-center justify-center rounded-[5px] transition duration-200 active:scale-95 sm:size-16 motion-reduce:transform-none",
                            isActive ? "bg-transparent" : cn(inactiveClass, "hover:-translate-y-0.5"),
                        )}
                    >
                        {isActive ? (
                            <motion.span
                                layoutId="open-project-active-view"
                                className="absolute inset-0 rounded-[5px] bg-pronix-blue"
                                transition={{type: "spring", stiffness: 420, damping: 36}}
                            />
                        ) : null}
                        <img alt="" aria-hidden className="relative size-7 sm:size-11" src={action.icon} />
                    </Link>
                );
            })}
        </div>
    );
}

export default OpenProjectFigmaActions;
