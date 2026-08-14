import {useEffect, useState, type ReactNode} from "react";
import {compose} from "redux";
import {Link, Navigate, useParams, useSearchParams} from "react-router-dom";
import {ChevronLeft} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import {parseFloorLevel} from "@propertyManagementModule/clients/client/public/project/shared/parseFloorLevel.ts";
import {useProjectId} from "@propertyManagementModule/clients/client/public/project/shared/useProjectId.ts";
import {resolveProjectFallbackImage} from "@propertyManagementModule/clients/client/public/project/shared/resolveProjectFallbackImage.ts";
import OpenProjectFigma3dStage from "@propertyManagementModule/clients/client/public/openProjectFigma/openProjectFigma3dStage.tsx";
import OpenProjectFigmaFloorPanel from "@propertyManagementModule/clients/client/public/openProjectFigma/openProjectFigmaFloorPanel.tsx";
import type {MarketingEdificeListItem, MarketingProjectSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {
    isOpenProjectFigmaView,
    openProjectFigmaPath,
} from "@propertyManagementModule/clients/client/public/openProjectFigma/openProjectFigmaPaths.ts";
import OpenProjectFigmaActions from "@propertyManagementModule/clients/client/public/openProjectFigma/openProjectFigmaActions.tsx";
import OpenProjectFigmaGalleryStage from "@propertyManagementModule/clients/client/public/openProjectFigma/openProjectFigmaGalleryStage.tsx";
import OpenProjectFigmaEdificeStats from "@propertyManagementModule/clients/client/public/openProjectFigma/openProjectFigmaEdificeStats.tsx";
import OpenProjectFigmaFinanceChart from "@propertyManagementModule/clients/client/public/openProjectFigma/openProjectFigmaFinanceChart.tsx";
import OpenProjectFigmaGridView from "@propertyManagementModule/clients/client/public/openProjectFigma/openProjectFigmaGridView.tsx";

type MarketingProjectSingleResponse = {project: MarketingProjectSingle};

const LANGUAGE_PATH = "src/modules/propertyManagement/clients/client/public/openProjectFigma/index.tsx";

const NODE_BY_VIEW = {
    "3d": {id: "467:685", name: "Open project - 3D"},
    gallery: {id: "472:997", name: "Open project - Gallery"},
    finance: {id: "475:1240", name: "Open project - Finance"},
    grid: {id: "494:548", name: "Open project - Grid view"},
} as const;

type PageProps = WithLanguageType & WithAxiosType<MarketingProjectSingleResponse, {projectId: string}>;

function SplitChrome({
    project,
    resolveLanguageKey,
    actions,
    stage,
    statsVariant = "gallery",
}: {
    project: MarketingProjectSingle;
    resolveLanguageKey: WithLanguageType["resolveLanguageKey"];
    actions: ReactNode;
    stage: (args: {
        selectedEdificeId?: string;
        selectedEdifice?: MarketingEdificeListItem;
        onSelectEdifice: (edificeId: string) => void;
    }) => ReactNode;
    statsVariant?: "gallery" | "finance";
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const edifices = project.edifices ?? [];
    const requestedEdificeId = searchParams.get("edificeId") ?? "";
    const selectedEdifice =
        edifices.find((edifice) => edifice._id === requestedEdificeId) ?? edifices[0];

    const selectEdifice = (edificeId: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("projectId", project._id);
        params.set("edificeId", edificeId);
        setSearchParams(params);
    };

    return (
        <div className="relative flex h-full min-h-0 flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:gap-x-8 lg:gap-y-6">
            <div className="flex shrink-0 flex-col gap-1.5 lg:col-start-1 lg:row-start-1">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:gap-4">
                    <Link
                        to="/projects"
                        className="-ml-2 flex shrink-0 items-center justify-center rounded-[5px] p-1 text-pronix-ink transition hover:bg-[rgba(24,24,24,0.04)] sm:-ml-2.5 md:-ml-3"
                        aria-label={String(resolveLanguageKey("backToProjects"))}
                    >
                        <ChevronLeft className="size-8 sm:size-10 md:size-12" strokeWidth={1.5} aria-hidden />
                    </Link>
                    <h1 className="min-w-0 flex-1 wrap-break-word font-aeonik-medium text-4xl leading-[1.2] text-pronix-ink not-italic sm:text-5xl lg:text-[83px]">
                        {project.name}
                    </h1>
                </div>
                {project.location ? (
                    <p className="font-aeonik-light text-xl leading-[1.2] text-pronix-ink lg:text-2xl">
                        {project.location}
                    </p>
                ) : null}
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto lg:contents">
                <div className="w-full min-w-0 shrink-0 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:h-full lg:min-h-0">
                    {stage({
                        selectedEdificeId: selectedEdifice?._id,
                        selectedEdifice,
                        onSelectEdifice: selectEdifice,
                    })}
                </div>
                {selectedEdifice ? (
                    <div className="w-full min-w-0 shrink-0 pb-2 lg:col-start-1 lg:row-start-2 lg:min-h-0 lg:overflow-y-auto lg:pb-0 lg:pr-1">
                        <OpenProjectFigmaEdificeStats
                            edifice={selectedEdifice}
                            resolveLanguageKey={resolveLanguageKey}
                            variant={statsVariant}
                        />
                    </div>
                ) : null}
            </div>
            <div className="shrink-0 bg-white pt-2 lg:col-start-1 lg:row-start-3 lg:bg-transparent lg:pt-4">
                {actions}
            </div>
            <p className="sr-only">{resolveLanguageKey("figmaPreviewHint")}</p>
        </div>
    );
}

function formatFloorHeading(floor: {name?: string; levelNumber?: string | number} | undefined): string {
    if (floor?.name?.trim()) {
        return floor.name;
    }
    const level = parseFloorLevel(floor?.levelNumber);
    if (level === -1) {
        return "Basement";
    }
    if (level === 0) {
        return "Ground";
    }
    return `Floor ${level}`;
}

function findEdificeForFloor(project: MarketingProjectSingle, floorId: string) {
    return project.edifices?.find((edifice) => edifice.floors?.some((floor) => floor._id === floorId));
}

function OpenProjectFigma3dPage({
    project,
    resolveLanguageKey,
}: {
    project: MarketingProjectSingle;
    resolveLanguageKey: WithLanguageType["resolveLanguageKey"];
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedFloorId = searchParams.get("floorId") ?? "";
    const requestedEdificeId = searchParams.get("edificeId") ?? "";
    const selectedEdifice = selectedFloorId
        ? findEdificeForFloor(project, selectedFloorId)
        : project.edifices?.find((edifice) => edifice._id === requestedEdificeId)
            ?? (project.edifices?.length === 1 ? project.edifices[0] : undefined);
    const selectedFloor = selectedEdifice?.floors?.find((floor) => floor._id === selectedFloorId);
    const placeholderImage = resolveProjectFallbackImage(project);
    const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);

    const clearFloor = () => {
        const params = new URLSearchParams(searchParams);
        params.set("projectId", project._id);
        params.delete("edificeId");
        params.delete("floorId");
        setSearchParams(params);
    };

    return (
        <div className="relative h-dvh w-full overflow-hidden bg-[#0c1018]" data-node-id="467:685">
            <img
                alt=""
                className="pointer-events-none absolute inset-0 size-full scale-110 object-cover opacity-50 blur-3xl"
                src={placeholderImage}
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(12,16,24,0.15)_0%,rgba(12,16,24,0.72)_100%)]" />
            <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            <div className="absolute inset-0">
                <OpenProjectFigma3dStage project={project} resolveLanguageKey={resolveLanguageKey} />
            </div>

            <div className="pointer-events-none absolute inset-0 z-10">
                <div className="pointer-events-auto">
                    <PublicSection flush>
                        <PageHeaderSection variant="hero" />
                    </PublicSection>
                </div>

                <div className={`absolute inset-x-4 top-24 text-white sm:inset-x-6 lg:inset-x-[52px] lg:top-28 ${selectedFloor ? "lg:pr-[32rem]" : ""}`}>
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:gap-4">
                        <Link
                            to="/projects"
                            className="pointer-events-auto -ml-2 flex shrink-0 items-center justify-center rounded-[5px] p-1 text-white transition hover:bg-white/10 sm:-ml-2.5 md:-ml-3"
                            aria-label={String(resolveLanguageKey("backToProjects"))}
                        >
                            <ChevronLeft className="size-8 sm:size-10 md:size-12" strokeWidth={1.5} aria-hidden />
                        </Link>
                        <h1 className="min-w-0 flex-1 wrap-break-word font-aeonik-medium text-4xl leading-[1.2] tracking-normal not-italic sm:text-5xl lg:text-[83.1px]">
                            {project.name}
                        </h1>
                    </div>
                    {selectedEdifice?.name ? (
                        <p className="mt-1.5 font-aeonik-light text-xl leading-[1.2] lg:text-2xl">{selectedEdifice.name}</p>
                    ) : null}
                    {project.location || selectedEdifice?.location ? (
                        <p className="mt-1.5 font-aeonik-light text-xl leading-[1.2] lg:text-2xl">
                            {selectedEdifice?.location || project.location}
                        </p>
                    ) : null}
                    <Link
                        to={openProjectFigmaPath("grid", project._id)}
                        className="pointer-events-auto mt-3 inline-block font-aeonik-light text-lg text-white underline decoration-white/70 underline-offset-4 transition hover:decoration-white lg:text-xl"
                    >
                        {resolveLanguageKey("viewAllUnits")}
                    </Link>
                </div>

                <div className="pointer-events-auto absolute bottom-10 left-4 z-30 sm:left-6 lg:left-[52px]">
                    <OpenProjectFigmaActions projectId={project._id} active="3d" tone="onDark" />
                </div>

                {selectedFloor ? (
                    <aside className="pointer-events-auto absolute inset-x-4 top-36 bottom-32 z-20 flex min-h-0 flex-col overflow-hidden sm:inset-x-6 sm:top-44 lg:inset-x-auto lg:top-1/2 lg:bottom-auto lg:right-[52px] lg:h-[70dvh] lg:max-h-[70dvh] lg:w-[30rem] lg:-translate-y-1/2">
                        <OpenProjectFigmaFloorPanel
                            project={project}
                            floorId={selectedFloor._id}
                            resolveLanguageKey={resolveLanguageKey}
                            hoveredUnitId={hoveredUnitId}
                            onUnitHover={setHoveredUnitId}
                            onClose={clearFloor}
                            panelTitle={
                                selectedEdifice
                                    ? `${selectedEdifice.name} / ${formatFloorHeading(selectedFloor)}`
                                    : formatFloorHeading(selectedFloor)
                            }
                        />
                    </aside>
                ) : null}
            </div>
        </div>
    );
}

function OpenProjectFigmaPage(props: PageProps) {
    const {resolveLanguageKey, data, loading, onFilterChange} = props;
    const projectId = useProjectId();
    const {view: viewParam} = useParams();
    const view = isOpenProjectFigmaView(viewParam) ? viewParam : null;

    useEffect(() => {
        if (projectId) {
            onFilterChange({projectId});
        }
    }, [projectId]);

    if (!view) {
        return <Navigate to={openProjectFigmaPath("3d", projectId)} replace />;
    }

    const project = data?.project;
    const node = NODE_BY_VIEW[view];

    return (
        <PublicPageShell nodeId={node.id} nodeName={node.name}>
            {view === "grid" ? (
                <PublicSection flush>
                    <PageHeaderSection variant="light" />
                </PublicSection>
            ) : null}

            {!projectId ? (
                <PublicSection>
                    <p className="font-aeonik-light text-lg text-pronix-ink-muted">{resolveLanguageKey("missingProjectId")}</p>
                </PublicSection>
            ) : loading && !project ? (
                <PublicSection>
                    <div className="flex min-h-[400px] items-center justify-center">
                        <Loader />
                    </div>
                </PublicSection>
            ) : !project ? (
                <PublicSection>
                    <p className="font-aeonik-light text-lg text-pronix-ink-muted">{resolveLanguageKey("notFound")}</p>
                </PublicSection>
            ) : view === "grid" ? (
                <PublicSection>
                    <OpenProjectFigmaGridView project={project} resolveLanguageKey={resolveLanguageKey} />
                </PublicSection>
            ) : view === "3d" ? (
                <OpenProjectFigma3dPage project={project} resolveLanguageKey={resolveLanguageKey} />
            ) : (
                <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
                    <PublicSection flush>
                        <PageHeaderSection variant="light" />
                    </PublicSection>
                    <PublicSection
                        flush
                        className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-[52px] lg:py-8"
                    >
                        <SplitChrome
                            project={project}
                            resolveLanguageKey={resolveLanguageKey}
                            actions={
                                <OpenProjectFigmaActions
                                    projectId={project._id}
                                    active={view}
                                    tone="onLight"
                                />
                            }
                            statsVariant={view === "finance" ? "finance" : "gallery"}
                            stage={({selectedEdificeId, selectedEdifice, onSelectEdifice}) =>
                                view === "gallery" ? (
                                    <OpenProjectFigmaGalleryStage
                                        project={project}
                                        selectedEdificeId={selectedEdificeId}
                                        onSelectEdifice={onSelectEdifice}
                                    />
                                ) : (
                                    <OpenProjectFigmaFinanceChart
                                        title={String(resolveLanguageKey("priceHistory"))}
                                        emptyLabel={String(resolveLanguageKey("priceHistoryEmpty"))}
                                        ariaLabel={String(resolveLanguageKey("priceHistoryChartAriaLabel"))}
                                        pricePerSqmTemplate={String(resolveLanguageKey("priceHistoryPerSqm"))}
                                        formatTooltip={(label, value) => {
                                            const template = String(resolveLanguageKey("priceHistoryChartTooltip"));
                                            return template.replace("{{label}}", label).replace("{{value}}", value);
                                        }}
                                        entries={selectedEdifice?.priceHistory ?? []}
                                    />
                                )
                            }
                        />
                    </PublicSection>
                </div>
            )}
        </PublicPageShell>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withAxios<MarketingProjectSingleResponse, {projectId: string}>(
        {method: "post", url: "/api/realEstate/marketingProjectCatalog/single", data: {}},
        true,
    ),
    withDebug(true, true),
)(OpenProjectFigmaPage);
