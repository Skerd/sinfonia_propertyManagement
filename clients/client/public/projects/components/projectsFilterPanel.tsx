import {useEffect, type ReactNode} from "react";
import {createPortal} from "react-dom";
import {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import ProjectsPriceRangeFilter from "@propertyManagementModule/clients/client/public/projects/components/projectsPriceRangeFilter.tsx";
import {
    projectsAssets,
    projectsPropertyTypeIcons,
} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import {
    BEDROOM_FILTERS,
    PROPERTY_TYPE_IDS,
    ProjectsFilterState,
    ProjectsPriceBounds,
    PropertyTypeId,
} from "@propertyManagementModule/clients/client/public/projects/shared/projectsFilterTypes.ts";
import {
    PUBLIC_CONTENT_FRAME,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type ProjectsFilterPanelProps = {
    open: boolean;
    draft: ProjectsFilterState;
    bounds: ProjectsPriceBounds;
    priceSamples: number[];
    projectOptions: {id: string; name: string}[];
    cityOptions: string[];
    onClose: () => void;
    onDraftChange: (next: ProjectsFilterState) => void;
    onApply: () => void;
    onReset: () => void;
    resolveLanguageKey: ResolveLanguageKey;
};

const selectInnerClassName =
    "min-w-0 flex-1 appearance-none border-0 bg-transparent font-aeonik-light text-base text-pronix-ink not-italic outline-none md:text-2xl";

type FilterSelectRowProps = {
    label: ReactNode;
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
    dataNodeId?: string;
};

function FilterSelectRow({label, value, onChange, children, dataNodeId}: FilterSelectRowProps) {
    return (
        <label className="flex min-w-0 flex-col gap-4" data-node-id={dataNodeId}>
            <span className={`${PUBLIC_SUBTITLE} text-pronix-ink`}>{label}</span>
            <div className="flex items-center justify-between gap-4 rounded-[5px] border border-pronix-border px-4 py-3 md:px-6">
                <select value={value} onChange={(event) => onChange(event.target.value)} className={selectInnerClassName}>
                    {children}
                </select>
                <img
                    alt=""
                    aria-hidden
                    className="size-6 shrink-0 pointer-events-none"
                    src={projectsAssets.filterChevronRight}
                />
            </div>
        </label>
    );
}

function ProjectsFilterPanel({
    open,
    draft,
    bounds,
    priceSamples,
    projectOptions,
    cityOptions,
    onClose,
    onDraftChange,
    onApply,
    onReset,
    resolveLanguageKey,
}: ProjectsFilterPanelProps) {
    useEffect(() => {
        if (!open) {
            return;
        }
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    function patchDraft(patch: Partial<ProjectsFilterState>) {
        onDraftChange({...draft, ...patch});
    }

    function togglePropertyType(type: PropertyTypeId) {
        patchDraft({propertyType: draft.propertyType === type ? null : type});
    }

    return createPortal(
        <div
            className="fixed inset-0 z-[150] flex flex-col sm:items-center sm:justify-center sm:bg-black/40 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="projects-filter-title"
            onClick={onClose}
        >
            <div
                className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white sm:max-h-[90vh] sm:w-full sm:max-w-5xl sm:flex-none sm:rounded-[5px] sm:shadow-lg"
                onClick={(event) => event.stopPropagation()}
                data-node-id="268:391"
            >
                <div className={`${PUBLIC_CONTENT_FRAME} flex flex-col gap-10 py-8 md:gap-12 md:py-12`}>
                    <div
                        className="flex items-center justify-between border-b border-pronix-border pb-6"
                        data-node-id="268:398"
                    >
                        <h2 id="projects-filter-title" className={PUBLIC_TITLE} data-node-id="268:392">
                            {resolveLanguageKey("filtersTitle")}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex size-11 items-center justify-center rounded-[5px] border border-pronix-border"
                            aria-label={resolveLanguageKey("filterClose") as string}
                            data-node-id="268:395"
                        >
                            <img alt="" aria-hidden className="size-8 md:size-9" src={projectsAssets.filterClose} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-10 md:gap-12" data-node-id="268:529">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10" data-node-id="268:496">
                            <FilterSelectRow
                                label={resolveLanguageKey("filterProject")}
                                value={draft.projectId}
                                onChange={(projectId) => patchDraft({projectId})}
                                dataNodeId="268:697"
                            >
                                <option value="any">{resolveLanguageKey("filterAny")}</option>
                                {projectOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </FilterSelectRow>
                            <FilterSelectRow
                                label={resolveLanguageKey("filterCity")}
                                value={draft.city}
                                onChange={(city) => patchDraft({city})}
                                dataNodeId="268:698"
                            >
                                <option value="any">{resolveLanguageKey("filterAny")}</option>
                                {cityOptions.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </FilterSelectRow>
                        </div>

                        <div className="flex flex-col gap-4" data-node-id="268:656">
                            <p className={`${PUBLIC_SUBTITLE} text-pronix-ink`}>
                                {resolveLanguageKey("filterPropertyType")}
                            </p>
                            <div
                                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
                                data-node-id="268:658"
                            >
                                {PROPERTY_TYPE_IDS.map((type) => {
                                    const active = draft.propertyType === type;
                                    const iconSrc =
                                        active && type === "apartment"
                                            ? projectsPropertyTypeIcons.apartment
                                            : projectsAssets.propertyTypeBuilding;

                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => togglePropertyType(type)}
                                            className={`flex flex-col gap-2.5 rounded-[5px] border p-3 text-left transition md:gap-2.5 md:p-3 ${
                                                active
                                                    ? "border-transparent bg-pronix-blue text-white"
                                                    : "border-pronix-border text-pronix-ink"
                                            }`}
                                        >
                                            <div className="relative size-[45px] shrink-0 overflow-hidden">
                                                <div className="absolute inset-[18.89%_20%_18.89%_17.78%]">
                                                    <img
                                                        alt=""
                                                        aria-hidden
                                                        className={`absolute inset-0 size-full max-w-none ${active ? "brightness-0 invert" : ""}`}
                                                        src={iconSrc}
                                                    />
                                                </div>
                                            </div>
                                            <span className="font-aeonik-light text-base not-italic md:text-2xl">
                                                {resolveLanguageKey(`propertyType${type.charAt(0).toUpperCase()}${type.slice(1)}`)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4" data-node-id="268:497">
                            <p className={`${PUBLIC_SUBTITLE} text-pronix-ink`}>
                                {resolveLanguageKey("filterBedrooms")}
                            </p>
                            <div className="flex flex-wrap gap-3 md:gap-6" data-node-id="268:499">
                                {BEDROOM_FILTERS.map((bedroom) => {
                                    const active = draft.bedrooms === bedroom;
                                    const labelKey =
                                        bedroom === "any"
                                            ? "filterAny"
                                            : bedroom === "6+"
                                              ? "filterBedroom6Plus"
                                              : `filterBedroom${bedroom}`;
                                    return (
                                        <button
                                            key={bedroom}
                                            type="button"
                                            onClick={() => patchDraft({bedrooms: bedroom})}
                                            className={`min-w-16 rounded-[5px] px-4 py-3 font-aeonik-light text-base not-italic transition md:min-w-20 md:px-5 md:text-2xl ${
                                                active
                                                    ? "bg-pronix-blue text-white"
                                                    : "border border-pronix-border text-pronix-ink"
                                            }`}
                                        >
                                            {resolveLanguageKey(labelKey)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <label className="flex max-w-md flex-col gap-4" data-node-id="268:704">
                            <span className={`${PUBLIC_SUBTITLE} text-pronix-ink`}>
                                {resolveLanguageKey("filterArea")}
                            </span>
                            <div className="flex items-center justify-between gap-4 rounded-[5px] border border-pronix-border px-4 py-3 md:px-6">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={draft.areaSqm}
                                    onChange={(event) => patchDraft({areaSqm: event.target.value})}
                                    placeholder={resolveLanguageKey("filterAreaPlaceholder") as string}
                                    className="min-w-0 flex-1 border-0 bg-transparent font-aeonik-light text-base text-pronix-ink not-italic outline-none md:text-2xl"
                                />
                                <img
                                    alt=""
                                    aria-hidden
                                    className="size-6 shrink-0 pointer-events-none"
                                    src={projectsAssets.filterChevronRight}
                                    data-node-id="268:708"
                                />
                            </div>
                        </label>

                        <ProjectsPriceRangeFilter
                            priceMin={draft.priceMin}
                            priceMax={draft.priceMax}
                            bounds={bounds}
                            priceSamples={priceSamples}
                            onChange={(next) => patchDraft(next)}
                            resolveLanguageKey={resolveLanguageKey}
                        />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-node-id="268:2905">
                            <button
                                type="button"
                                onClick={onReset}
                                className="rounded-[5px] border border-pronix-blue px-4 py-4 font-aeonik-medium text-lg text-pronix-blue not-italic md:text-xl"
                                data-node-id="268:2906"
                            >
                                {resolveLanguageKey("filterReset")}
                            </button>
                            <button
                                type="button"
                                onClick={onApply}
                                className="rounded-[5px] bg-pronix-blue px-4 py-4 font-aeonik-medium text-lg text-white not-italic md:text-xl"
                                data-node-id="268:2908"
                            >
                                {resolveLanguageKey("filterApply")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}

export default ProjectsFilterPanel;
