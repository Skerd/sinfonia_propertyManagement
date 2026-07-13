import type {MarketingEdificeListItem, MarketingFloorListItem, MarketingPolygonItem} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import type {ProjectViewerLevel} from "@propertyManagementModule/clients/client/public/project/shared/useProjectViewerState.ts";
import {parseFloorLevel} from "@propertyManagementModule/clients/client/public/project/shared/parseFloorLevel.ts";

type ProjectViewerSidebarProps = {
    level: ProjectViewerLevel;
    edifices: MarketingEdificeListItem[];
    sortedFloors: MarketingFloorListItem[];
    selectedEdificeId: string;
    selectedFloorId: string;
    selectedEdifice?: MarketingEdificeListItem;
    selectedFloor?: MarketingFloorListItem;
    onSelectEdifice: (edificeId: string) => void;
    onSelectFloor: (floorId: string) => void;
    resolveLanguageKey: (key: string) => string;
};

function formatFloorLabel(floor: MarketingFloorListItem): string {
    if (floor.name?.trim()) {
        return floor.name;
    }
    const level = parseFloorLevel(floor.levelNumber);
    if (level === -1) {
        return "Basement";
    }
    if (level === 0) {
        return "Ground";
    }
    return `Floor ${level}`;
}

function ProjectViewerSidebar({
    level,
    edifices,
    sortedFloors,
    selectedEdificeId,
    selectedFloorId,
    selectedEdifice,
    selectedFloor,
    onSelectEdifice,
    onSelectFloor,
    resolveLanguageKey,
}: ProjectViewerSidebarProps) {
    const titleKey =
        level === "floor" ? "sidebarFloors" : level === "edifice" ? "sidebarFloors" : "sidebarEdifices";

    const items: {id: string; label: string; meta?: string}[] =
        level === "project"
            ? edifices.map((edifice) => ({
                  id: edifice._id,
                  label: edifice.name || resolveLanguageKey("unnamedEdifice"),
                  meta:
                      edifice.floors?.length != null
                          ? `${edifice.floors.length} ${resolveLanguageKey("floorsLabel")}`
                          : undefined,
              }))
            : sortedFloors.map((floor) => ({
                  id: floor._id,
                  label: formatFloorLabel(floor),
                  meta:
                      floor.units?.length != null
                          ? `${floor.units.length} ${resolveLanguageKey("unitsLabel")}`
                          : undefined,
              }));

    const selectedId = level === "project" ? selectedEdificeId : selectedFloorId;
    const onSelect = level === "project" ? onSelectEdifice : onSelectFloor;

    const contextTitle =
        level === "floor"
            ? selectedFloor?.name || formatFloorLabel(selectedFloor ?? ({} as MarketingFloorListItem))
            : level === "edifice"
              ? selectedEdifice?.name || resolveLanguageKey("unnamedEdifice")
              : resolveLanguageKey("sidebarProject");

    return (
        <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[5px] border border-pronix-border bg-white">
            <div className="border-b border-pronix-border px-5 pb-4 pt-5">
                <p className="font-aeonik-light text-sm text-pronix-ink-muted md:text-base">
                    {resolveLanguageKey("sidebarContext")}
                </p>
                <h2 className="mt-1 font-aeonik-medium text-xl text-pronix-ink not-italic md:text-2xl">
                    {contextTitle}
                </h2>
                <p className="mt-3 font-aeonik-light text-base text-pronix-ink-muted md:text-lg">
                    {resolveLanguageKey(titleKey)}
                </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                {items.length === 0 ? (
                    <p className="px-2 py-4 font-aeonik-light text-base text-pronix-ink-muted md:text-lg">
                        {resolveLanguageKey(level === "project" ? "sidebarNoEdifices" : "sidebarNoFloors")}
                    </p>
                ) : (
                    <ul className="flex flex-col gap-1">
                        {items.map((item) => {
                            const active = item.id === selectedId;
                            return (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelect(item.id)}
                                        className={`flex w-full flex-col rounded-[5px] px-3 py-3 text-left transition ${
                                            active
                                                ? "bg-pronix-blue text-white"
                                                : "text-pronix-ink hover:bg-[rgba(24,24,24,0.04)]"
                                        }`}
                                    >
                                        <span className="font-aeonik-medium text-base md:text-lg">{item.label}</span>
                                        {item.meta && (
                                            <span
                                                className={`mt-0.5 font-aeonik-light text-sm md:text-base ${
                                                    active ? "text-white/80" : "text-pronix-ink-muted"
                                                }`}
                                            >
                                                {item.meta}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
}

export default ProjectViewerSidebar;

export type {MarketingPolygonItem};
