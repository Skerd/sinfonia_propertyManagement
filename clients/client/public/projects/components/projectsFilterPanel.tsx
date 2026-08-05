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
    PUBLIC_HEADING,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {lockPublicBodyScroll} from "@propertyManagementModule/clients/client/public/shared/lockPublicBodyScroll.ts";

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
    "min-w-0 flex-1 appearance-none border-0 bg-transparent font-aeonik-light text-base text-pronix-ink not-italic outline-none md:text-lg";

const filterLabelClassName =
    "cursor-default font-aeonik-light text-pronix-ink not-italic leading-[1.4] text-base md:text-lg";

const filterFieldShellClassName =
    "flex items-center justify-between gap-3 rounded-[5px] border border-pronix-border px-3 py-2 transition duration-200 hover:border-[rgba(24,24,24,0.4)] hover:shadow-sm focus-within:border-pronix-blue focus-within:shadow-sm md:px-4";

const filterChipIdleClassName =
    "border border-pronix-border text-pronix-ink hover:border-pronix-blue hover:bg-pronix-blue/5 hover:shadow-sm";

const filterChipActiveClassName = "border border-transparent bg-pronix-blue text-white shadow-sm";

type FilterSelectRowProps = {
    label: ReactNode;
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
    dataNodeId?: string;
};

function FilterSelectRow({label, value, onChange, children, dataNodeId}: FilterSelectRowProps) {
    return (
        <label className="flex min-w-0 flex-col gap-2" data-node-id={dataNodeId}>
            <span className={filterLabelClassName}>{label}</span>
            <div className={filterFieldShellClassName}>
                <select value={value} onChange={(event) => onChange(event.target.value)} className={selectInnerClassName}>
                    {children}
                </select>
                <img
                    alt=""
                    aria-hidden
                    className="size-5 shrink-0 pointer-events-none"
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
        const unlockScroll = lockPublicBodyScroll();
        window.addEventListener("keydown", onKey);
        return () => {
            unlockScroll();
            window.removeEventListener("keydown", onKey);
        };
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
                <div className={`${PUBLIC_CONTENT_FRAME} flex flex-col gap-5 py-5 md:gap-6 md:py-6`}>
                    <div
                        className="flex items-center justify-between border-b border-pronix-border pb-3"
                        data-node-id="268:398"
                    >
                        <h2 id="projects-filter-title" className={PUBLIC_HEADING} data-node-id="268:392">
                            {resolveLanguageKey("filtersTitle")}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex size-9 items-center justify-center rounded-[5px] border border-pronix-border transition duration-200 hover:border-pronix-ink hover:bg-pronix-ink/5 hover:shadow-sm"
                            aria-label={resolveLanguageKey("filterClose") as string}
                            data-node-id="268:395"
                        >
                            <img alt="" aria-hidden className="size-6" src={projectsAssets.filterClose} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-5 md:gap-6" data-node-id="268:529">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4" data-node-id="268:496">
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

                        <div className="flex flex-col gap-2" data-node-id="268:656">
                            <p className={filterLabelClassName}>
                                {resolveLanguageKey("filterPropertyType")}
                            </p>
                            <div
                                className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
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
                                            className={`flex flex-col gap-1.5 rounded-[5px] border p-2 text-left transition duration-200 ${
                                                active ? filterChipActiveClassName : filterChipIdleClassName
                                            }`}
                                        >
                                            <div className="relative size-8 shrink-0 overflow-hidden">
                                                <div className="absolute inset-[18.89%_20%_18.89%_17.78%]">
                                                    <img
                                                        alt=""
                                                        aria-hidden
                                                        className={`absolute inset-0 size-full max-w-none ${active ? "brightness-0 invert" : ""}`}
                                                        src={iconSrc}
                                                    />
                                                </div>
                                            </div>
                                            <span className="font-aeonik-light text-sm not-italic md:text-base">
                                                {resolveLanguageKey(`propertyType${type.charAt(0).toUpperCase()}${type.slice(1)}`)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2" data-node-id="268:497">
                            <p className={filterLabelClassName}>
                                {resolveLanguageKey("filterBedrooms")}
                            </p>
                            <div className="flex flex-wrap gap-2" data-node-id="268:499">
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
                                            className={`min-w-12 rounded-[5px] px-3 py-2 font-aeonik-light text-sm not-italic transition duration-200 md:min-w-14 md:text-base ${
                                                active ? filterChipActiveClassName : filterChipIdleClassName
                                            }`}
                                        >
                                            {resolveLanguageKey(labelKey)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <label className="flex max-w-md flex-col gap-2" data-node-id="268:704">
                            <span className={filterLabelClassName}>
                                {resolveLanguageKey("filterArea")}
                            </span>
                            <div className={filterFieldShellClassName}>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={draft.areaSqm}
                                    onChange={(event) => patchDraft({areaSqm: event.target.value})}
                                    placeholder={resolveLanguageKey("filterAreaPlaceholder") as string}
                                    className="min-w-0 flex-1 border-0 bg-transparent font-aeonik-light text-base text-pronix-ink not-italic outline-none md:text-lg"
                                />
                                <img
                                    alt=""
                                    aria-hidden
                                    className="size-5 shrink-0 pointer-events-none"
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

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-node-id="268:2905">
                            <button
                                type="button"
                                onClick={onReset}
                                className="cursor-pointer rounded-[5px] border border-pronix-blue px-4 py-2.5 font-aeonik-medium text-base text-pronix-blue not-italic transition duration-200 hover:bg-pronix-blue/5 hover:shadow-sm md:text-lg"
                                data-node-id="268:2906"
                            >
                                {resolveLanguageKey("filterReset")}
                            </button>
                            <button
                                type="button"
                                onClick={onApply}
                                className="cursor-pointer rounded-[5px] bg-pronix-blue px-4 py-2.5 font-aeonik-medium text-base text-white not-italic transition duration-200 hover:opacity-90 hover:shadow-md md:text-lg"
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
