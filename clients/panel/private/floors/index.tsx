import {compose} from "redux";
import {useMemo} from "react";
import {useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconStackPush} from "@tabler/icons-react";
import {buildTitleBreadcrumb, buildUrlWithExistingParams} from "@coreModule/helpers/general";
import {Floor} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import FloorCard from "@propertyManagementModule/clients/panel/private/floors/center/cardView/floorCard.tsx";
import ViewUnits from "@propertyManagementModule/clients/panel/private/floors/center/actions/viewUnits.tsx";
import ViewUnitsOverlay from "@propertyManagementModule/clients/panel/private/floors/center/actions/viewUnitsOverlay.tsx";
import UnitsOverlay from "@propertyManagementModule/components/custom/floors/unitsOverlay.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_HIERARCHY} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";

export function buildFloorEditPath(floor: Floor) {
    return buildUrlWithExistingParams(
        window.location.href,
        "/realEstate/floors/edit",
        {
            floorId: floor._id ?? "",
            floorName: floor.name,
        }
    );
}

function AllFloors({resolveLanguageKey}: WithLanguageType) {
    const [searchParams] = useSearchParams();
    // const projectId = searchParams.get("projectId") || undefined;
    const projectName = searchParams.get("projectName") || undefined;
    const edificeId = searchParams.get("edificeId") || undefined;
    const edificeName = searchParams.get("edificeName") || undefined;
    const {read: readUnits} = useAccess("units");

    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "levelNumber",
            label: resolveLanguageKey("fields.levelNumber") as string,
            type: COLUMN_TYPE.NUMBER,
            placeholder: "#",
        },
        {
            field: "isAccessible",
            label: resolveLanguageKey("fields.isAccessible") as string,
            type: COLUMN_TYPE.BOOLEAN,
        },
        {
            field: "hasEmergencyExit",
            label: resolveLanguageKey("fields.hasEmergencyExit") as string,
            type: COLUMN_TYPE.BOOLEAN,
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<Floor>
            apiUrl="/api/realEstate/floor"
            collectionName="floors"
            accessModel="floors"
            tableConfigKey="floors"
            createPath={buildUrlWithExistingParams(window.location.href, "/realEstate/floors/create")}
            createIcon={<IconStackPush />}
            createLanguageKey="createFloor"
            buildEditPath={buildFloorEditPath}
            resolveLanguageKey={resolveLanguageKey}
            headerTitle={buildTitleBreadcrumb(resolveLanguageKey("title") as string, [projectName, edificeName])}
            headerDescription={resolveLanguageKey("description") as string}
            extraFilters={{edifice: edificeId ?? undefined}}
            quickFilters={quickFilters}
            configurations={{limit: 20}}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/floors/center/sheetView/floorSheetView.tsx"
            cardViewClassName={GRID_HIERARCHY}
            rowActionMenu={{allowMenuForCustomChildren: !!readUnits}}
            renderCard={(floor, onDelete, onRestore) => (
                <FloorCard
                    floor={floor}
                    onDelete={(row: Floor | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(floor)}
                />
            )}
            renderActionMenuChildren={(floor, bindRowAction) => (
                <>
                    <ViewUnits floor={floor} />
                    <ViewUnitsOverlay onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity: floor, resetAction}) =>
                action === "viewUnitsOverlay" ? (
                    <UnitsOverlay
                        floorMainImageId={(floor as Floor).mainImage?._id ?? ""}
                        floorName={floor.name ?? ""}
                        unitsCoordinates={(floor as Floor).unitsCoordinates}
                        openUnitOverlay={true}
                        onClose={resetAction}
                    />
                ) : null
            }
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/floors/index.tsx"),
    withDebug(true, true),
)(AllFloors);
