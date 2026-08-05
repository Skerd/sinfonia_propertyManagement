import {useEffect, useMemo, useState} from "react";
import {compose} from "redux";
import {Link} from "react-router-dom";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import {useDyeusProjectId} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusProjectId.ts";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import type {
    MarketingProjectSingle,
    MarketingUnitListItem,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type MarketingProjectSingleResponse = {project: MarketingProjectSingle};
type ViewMode = "list" | "grid";

type ResidencesPageProps = WithAxiosType<MarketingProjectSingleResponse, {projectId: string}>;

function collectUnits(project: MarketingProjectSingle | undefined): MarketingUnitListItem[] {
    if (!project?.edifices?.length) return [];
    const units: MarketingUnitListItem[] = [];
    for (const edifice of project.edifices) {
        for (const floor of edifice.floors ?? []) {
            for (const unit of floor.units ?? []) {
                units.push(unit);
            }
        }
    }
    return units;
}

function ResidencesPage({data, loading, onFilterChange}: ResidencesPageProps) {
    const {projectId, loading: resolvingProject} = useDyeusProjectId();
    const [view, setView] = useState<ViewMode>("grid");

    useEffect(() => {
        if (projectId) {
            onFilterChange({projectId});
        }
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [projectId]);

    const project = data?.project;
    const units = useMemo(() => collectUnits(project), [project]);
    const heroImage = project?.mainImage || dyeusAssets.night;

    return (
        <DyeusPageShell nodeId="44:residences" nodeName="Residences">
            <div className="relative">
                <DyeusHeader variant="solid" />
                <div className="mx-auto max-w-[1440px] px-6 pb-16 pt-28 md:px-12 md:pt-36">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-bronze">
                                Residences
                            </p>
                            <h1 className="mt-3 font-dyeus-serif text-5xl md:text-7xl">
                                {project?.name ?? "Dyeus Residence"}
                            </h1>
                            {project?.location || project?.city ? (
                                <p className="mt-3 font-dyeus-sans text-sm text-dyeus-ink-muted">
                                    {[project.location, project.city].filter(Boolean).join(" · ")}
                                </p>
                            ) : null}
                        </div>
                        <div className="flex gap-2">
                            {(["list", "grid"] as const).map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setView(mode)}
                                    className={`px-4 py-2 font-dyeus-sans text-xs uppercase tracking-[0.18em] transition ${
                                        view === mode
                                            ? "bg-dyeus-ink text-dyeus-cream"
                                            : "border border-dyeus-border text-dyeus-ink-muted hover:text-dyeus-ink"
                                    }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                        <div className="relative min-h-[360px] overflow-hidden md:min-h-[520px]">
                            <img src={heroImage} alt="" className="absolute inset-0 size-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-dyeus-ink/50 to-transparent" />
                            <p className="absolute bottom-6 left-6 font-dyeus-serif text-3xl text-dyeus-white md:text-4xl">
                                Interactive residence overview
                            </p>
                        </div>

                        <div className="bg-dyeus-white p-5 md:p-6">
                            {(resolvingProject || (loading && !project)) && (
                                <div className="flex min-h-[280px] items-center justify-center">
                                    <Loader />
                                </div>
                            )}
                            {!resolvingProject && !projectId && (
                                <p className="font-dyeus-sans text-sm text-dyeus-ink-muted">
                                    No Dyeus project is available for this company origin yet. Set{" "}
                                    <code className="text-dyeus-bronze">VITE_DYEUS_PROJECT_ID</code> or ensure a
                                    marketing project named Dyeus exists.
                                </p>
                            )}
                            {project && (
                                <>
                                    <p className="font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-bronze">
                                        Available units
                                    </p>
                                    <p className="mt-2 font-dyeus-serif text-3xl">{units.length}</p>
                                    <p className="mt-4 font-dyeus-sans text-sm leading-relaxed text-dyeus-ink-muted">
                                        {project.description ||
                                            "Browse residences by list or grid, then open a unit for floor plans and details."}
                                    </p>
                                    {(project.amenities ?? []).slice(0, 6).length > 0 && (
                                        <ul className="mt-6 space-y-2 border-t border-dyeus-border pt-5">
                                            {(project.amenities ?? []).slice(0, 6).map((amenity) => (
                                                <li key={amenity} className="font-dyeus-sans text-sm text-dyeus-ink-muted">
                                                    {amenity}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {units.length > 0 && (
                        <div
                            className={`mt-10 ${
                                view === "grid"
                                    ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                                    : "flex flex-col gap-3"
                            }`}
                        >
                            {units.map((unit) => (
                                <Link
                                    key={unit._id}
                                    to={`/property?projectId=${projectId}&unitId=${unit._id}`}
                                    className={`group border border-dyeus-border bg-dyeus-white transition hover:border-dyeus-bronze ${
                                        view === "list" ? "flex items-center gap-4 p-4" : "block overflow-hidden"
                                    }`}
                                >
                                    {view === "grid" && (
                                        <div className="relative aspect-[4/3] overflow-hidden bg-dyeus-sand">
                                            {unit.mainImage ? (
                                                <img
                                                    src={unit.mainImage}
                                                    alt=""
                                                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex size-full items-center justify-center font-dyeus-serif text-2xl text-dyeus-ink-faded">
                                                    {unit.name}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className={view === "grid" ? "p-4" : "min-w-0 flex-1"}>
                                        <div className="flex items-start justify-between gap-3">
                                            <h2 className="font-dyeus-serif text-2xl">{unit.name}</h2>
                                            <span className="shrink-0 font-dyeus-sans text-[11px] uppercase tracking-[0.16em] text-dyeus-bronze">
                                                {unit.status}
                                            </span>
                                        </div>
                                        <p className="mt-2 font-dyeus-sans text-sm text-dyeus-ink-muted">
                                            {[
                                                unit.floorLabel,
                                                unit.areaSqm != null ? `${unit.areaSqm} m²` : null,
                                                unit.bedrooms != null ? `${unit.bedrooms} bed` : null,
                                            ]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <DyeusFooter />
        </DyeusPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/residences/index.tsx"),
    withAxios<MarketingProjectSingleResponse, {projectId: string}>(
        {method: "post", url: "/api/realEstate/marketingProjectCatalog/single", data: {}},
        true,
    ),
    withDebug(true, true),
)(ResidencesPage);
