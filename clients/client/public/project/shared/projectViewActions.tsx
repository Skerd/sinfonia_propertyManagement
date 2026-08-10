import {Link, useLocation, useSearchParams} from "react-router-dom";
import {projectAssets} from "@propertyManagementModule/clients/client/public/project/projectAssets.ts";

const TABS = [
    {path: "/project", icon: projectAssets.iconGallery, label: "Project", nodeId: "472:991"},
] as const;

function ProjectViewActions() {
    const {pathname} = useLocation();
    const [searchParams] = useSearchParams();
    const query = searchParams.toString();
    const suffix = query ? `?${query}` : "";

    return (
        <nav
            className="flex flex-wrap items-center gap-4 pt-2"
            data-node-id="472:1146"
        >
            {TABS.map((tab) => {
                const active = pathname === tab.path;
                return (
                    <Link
                        key={tab.path}
                        to={`${tab.path}${suffix}`}
                        className={`relative flex size-14 shrink-0 items-center justify-center rounded-[5px] transition-colors duration-500 sm:size-16 ${
                            active
                                ? "bg-pronix-blue"
                                : "bg-black/20 backdrop-blur-[7px] hover:bg-pronix-blue"
                        }`}
                        data-node-id={tab.nodeId}
                        data-name="Actions"
                        aria-label={tab.label}
                        aria-current={active ? "page" : undefined}
                    >
                        <div className="absolute left-2.5 top-2.5 size-11 overflow-hidden sm:left-2.5 sm:top-2.5 sm:size-11">
                            <img alt="" aria-hidden className="size-full max-w-none object-contain" src={tab.icon} />
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
}

export default ProjectViewActions;
