import {Link, useLocation, useSearchParams} from "react-router-dom";

const TABS = [
    {path: "/project", label: "Project"},
] as const;

function ProjectTabNav() {
    const {pathname} = useLocation();
    const [searchParams] = useSearchParams();
    const query = searchParams.toString();
    const suffix = query ? `?${query}` : "";

    return (
        <nav
            className="absolute left-4 top-20 flex items-center gap-4 sm:gap-6 md:left-[52px] md:top-[120px]"
            data-node-id="project-tabs"
        >
            {TABS.map((tab) => (
                <Link
                    key={tab.path}
                    to={`${tab.path}${suffix}`}
                    className={`font-aeonik-medium text-base not-italic leading-none transition sm:text-lg md:text-xl ${
                        pathname === tab.path ? "text-pronix-blue" : "text-pronix-ink hover:opacity-70"
                    }`}
                >
                    {tab.label}
                </Link>
            ))}
        </nav>
    );
}

export default ProjectTabNav;
