import {compose} from "redux";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {MapPin} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Empty, EmptyHeader, EmptyTitle} from "@coreModule/components/ui/empty.tsx";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import type {
    MarketingProjectCatalogListItem,
    MarketingProjectsCatalogFormResponseType,
} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingProjectsCatalog/marketingProjectsCatalog.form.response.type.ts";

/** The company's developments, each opening its project page. */
function PropertyProjects({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    const [projects, setProjects] = useState<MarketingProjectCatalogListItem[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        apiClient.post<MarketingProjectsCatalogFormResponseType>("/api/realEstate/marketingProjectsCatalog", {})
            .then((res) => { if (!cancelled) setProjects(res.data.projects); })
            .catch(() => { if (!cancelled) setProjects([]); });
        return () => { cancelled = true; };
    }, []);

    if (projects === null) return <Loader />;

    return (
        <div className="flex flex-col gap-8">
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{resolveLanguageKey("title")}</h1>
            {projects.length === 0 ? (
                <Empty className="rounded-3xl bg-muted py-20">
                    <EmptyHeader><EmptyTitle className="font-display text-2xl font-bold">{resolveLanguageKey("none")}</EmptyTitle></EmptyHeader>
                </Empty>
            ) : (
                <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <li key={project._id}>
                            <Link to={`${base}/projects/${project._id}`} className="group flex flex-col gap-3">
                                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                                    {project.mainImage ? (
                                        <img src={project.mainImage} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                                    ) : null}
                                    {project.availableUnitCount ? (
                                        <Badge variant="secondary" className="absolute top-3 left-3 bg-background/90">
                                            {resolveLanguageKey("available").replace("{count}", String(project.availableUnitCount))}
                                        </Badge>
                                    ) : null}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <p className="font-display text-lg font-semibold">{project.name}</p>
                                    {project.city || project.location ? (
                                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-3.5" aria-hidden />{project.city ?? project.location}</p>
                                    ) : null}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default compose(withLanguage("src/modules/propertyManagement/clients/portal/propertyProjects.tsx"))(PropertyProjects);
