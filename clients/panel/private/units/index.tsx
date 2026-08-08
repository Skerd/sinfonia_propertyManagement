import {compose} from "redux";
import {useSearchParams} from "react-router-dom";
import {useMemo, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconFrustumPlus} from "@tabler/icons-react";
import {X} from "lucide-react";
import {ApiSelect} from "@coreModule/components/custom/apiSelect";
import {buildPageTitle, buildUrlWithExistingParams} from "@coreModule/helpers/general";
import {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import {UnitStatus} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.constants.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import UnitCard from "@propertyManagementModule/clients/panel/private/units/center/cardView/unitCard.tsx";
import {UnitDomainMenuItems} from "@propertyManagementModule/clients/panel/private/units/center/actions/unitDomainMenuItems.tsx";
import {buildUnitEditPath, unitDeleteConfirmLabel} from "@propertyManagementModule/clients/panel/private/units/unitNavigation.ts";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_HIERARCHY} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";

type AllUnitsProps = WithLanguageType & {
    edificeId?: string;
    showHeader?: boolean;
};

function AllUnits({resolveLanguageKey, edificeId: propEdificeId, showHeader = true}: AllUnitsProps) {
    const [searchParams] = useSearchParams();

    const projectId   = searchParams.get("projectId")   || undefined;
    const projectName = searchParams.get("projectName") || undefined;
    const edificeId   = propEdificeId ?? searchParams.get("edificeId") ?? undefined;
    const edificeName = searchParams.get("edificeName") || undefined;
    const floorId     = searchParams.get("floorId")     || undefined;
    const floorName   = searchParams.get("floorName")   || undefined;

    const headerTitle = useMemo(
        () => buildPageTitle(resolveLanguageKey("title") as string, [projectName, edificeName, floorName]),
        [resolveLanguageKey, projectName, edificeName, floorName],
    );

    const extraFilters = useMemo(
        () => ({
            ...(projectId  && {project: projectId}),
            ...(edificeId  && {edifice: edificeId}),
            ...(floorId    && {floor: floorId}),
        }),
        [projectId, edificeId, floorId],
    );

    // reservedBy / boughtFrom target users on the Reservation / Sale documents, which
    // the DSL filter engine can't reach, so they travel as plain list params (resolved
    // to units by the backend `extraListFilter`) instead of quick-filter DSL rules.
    const [reservedBy, setReservedBy] = useState<string>("");
    const [boughtFrom, setBoughtFrom] = useState<string>("");

    const extraParams = useMemo(
        () => ({
            ...(reservedBy && {reservedBy}),
            ...(boughtFrom && {boughtFrom}),
        }),
        [reservedBy, boughtFrom],
    );

    const userFilterBar = (
        <div className="flex items-center gap-4 flex-wrap pb-1">
            <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground shrink-0">
                    {resolveLanguageKey("reservedBy") as string}
                </span>
                <div className={`relative flex items-center${reservedBy ? " ring-1 ring-primary/30 rounded-md" : ""}`}>
                    <ApiSelect
                        apiUrl="/api/company/users/select"
                        postBody={{administration: true}}
                        value={reservedBy}
                        onValueChange={(v: string | string[]) => setReservedBy(typeof v === "string" ? v : "")}
                        placeholder={resolveLanguageKey("reservedByPlaceholder") as string}
                        className="h-8 text-sm min-w-[160px] max-w-[220px]"
                        pageSize={50}
                    />
                    {reservedBy && (
                        <button
                            type="button"
                            onClick={() => setReservedBy("")}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={resolveLanguageKey("clear") as string}
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground shrink-0">
                    {resolveLanguageKey("boughtFrom") as string}
                </span>
                <div className={`relative flex items-center${boughtFrom ? " ring-1 ring-primary/30 rounded-md" : ""}`}>
                    <ApiSelect
                        apiUrl="/api/company/users/select"
                        postBody={{administration: false}}
                        value={boughtFrom}
                        onValueChange={(v: string | string[]) => setBoughtFrom(typeof v === "string" ? v : "")}
                        placeholder={resolveLanguageKey("boughtFromPlaceholder") as string}
                        className="h-8 text-sm min-w-[160px] max-w-[220px]"
                        pageSize={50}
                    />
                    {boughtFrom && (
                        <button
                            type="button"
                            onClick={() => setBoughtFrom("")}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={resolveLanguageKey("clear") as string}
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "project",
            label: resolveLanguageKey("fields.project") as string,
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/project/select",
        },
        {
            field: "edifice",
            label: resolveLanguageKey("fields.edifice") as string,
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/edifice/select",
            dependsOn: "project",
        },
        {
            field: "floor",
            label: resolveLanguageKey("fields.floor") as string,
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/floor/select",
            dependsOn: ["edifice", "project"],
        },
        {
            field: "status",
            label: resolveLanguageKey("status") as string,
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                {value: UnitStatus.AVAILABLE,   label: resolveLanguageKey("available")  as string},
                {value: UnitStatus.RESERVED,    label: resolveLanguageKey("reserved")   as string},
                {value: UnitStatus.SOLD,        label: resolveLanguageKey("sold")       as string},
                {value: UnitStatus.RENTED,      label: resolveLanguageKey("rented") as string},
                {value: UnitStatus.UNAVAILABLE, label: resolveLanguageKey("notAvailable") as string},
            ],
        },
        {
            field: "unitType",
            label: resolveLanguageKey("unitType") as string,
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/unitType/select",
        },
        {
            field: "numberOfRooms",
            label: resolveLanguageKey("fields.numberOfRooms") as string,
            type: COLUMN_TYPE.NUMBER,
            placeholder: "#",
        },
        {
            field: "numberOfBathrooms",
            label: resolveLanguageKey("fields.numberOfBathrooms") as string,
            type: COLUMN_TYPE.NUMBER,
            placeholder: "#",
        },
        {
            field: "isAvailable",
            label: resolveLanguageKey("available") as string,
            type: COLUMN_TYPE.BOOLEAN,
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<Unit>
            apiUrl="/api/realEstate/unit"
            collectionName="units"
            accessModel="units"
            tableConfigKey="units"
            createPath={buildUrlWithExistingParams(window.location.href, "/realEstate/units/create")}
            createIcon={<IconFrustumPlus />}
            createLanguageKey="createUnit"
            hideHeader={!showHeader}
            buildEditPath={buildUnitEditPath}
            buildDeleteConfirmLabel={(unit, read) => unitDeleteConfirmLabel(read, unit)}
            resolveLanguageKey={resolveLanguageKey}
            headerTitle={headerTitle}
            extraFilters={extraFilters}
            extraParams={extraParams}
            aboveToolbar={userFilterBar}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/units/center/sheetView/unitSheetView.tsx"
            cardViewClassName={GRID_HIERARCHY}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderCard={(unit, onDelete, onRestore) => (
                <UnitCard
                    unit={unit}
                    onDelete={(response?: DeletedData) => onDelete(unit, response)}
                    onRestore={() => onRestore(unit)}
                />
            )}
            renderActionMenuChildren={(unit) => (
                <UnitDomainMenuItems
                    unitId={unit._id}
                    unitName={unit.name || unit.unitNumber || unit._id}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/units/index.tsx"),
    withDebug(true, true),
)(AllUnits);
