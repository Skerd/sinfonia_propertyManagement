import {compose} from "redux";
import {useCallback, useMemo} from "react";
import {useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconBuildingPlus} from "@tabler/icons-react";
import {buildPageTitle, buildUrlWithExistingParams} from "@coreModule/helpers/general";
import {Edifice} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import EdificeCard from "@propertyManagementModule/clients/panel/private/edifices/center/cardView/edificeCard.tsx";
import ViewFloors from "@propertyManagementModule/clients/panel/private/edifices/center/actions/viewFloors.tsx";
import ViewFloorsOverlay from "@propertyManagementModule/clients/panel/private/edifices/center/actions/viewFloorsOverlay.tsx";
import GenerateFloorsUnits from "@propertyManagementModule/clients/panel/private/edifices/center/actions/generateFloorsUnits.tsx";
import FloorsOverlay from "@propertyManagementModule/components/custom/edifices/floorsOverlay.tsx";
import GenerateFloorsUnitsDialog from "@propertyManagementModule/components/custom/edifices/generateFloorsUnitsDialog.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_HIERARCHY} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";

export function buildEdificeEditPath(edifice: Edifice){
    return buildUrlWithExistingParams(
        window.location.href,
        "/realEstate/edifices/edit",
        {
            edificeId: edifice._id ?? "",
            edificeName: edifice.name,
        }
    );
}

function AllEdifices({resolveLanguageKey}: WithLanguageType) {

    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId") || undefined;
    const projectName = searchParams.get("projectName");
    const {read: readFloors} = useAccess("floors");

    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "project",
            label: resolveLanguageKey("fields.project") as string,
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/project/select",
        },
        {
            field: "numberOfFloors",
            label: resolveLanguageKey("fields.numberOfFloors") as string,
            type: COLUMN_TYPE.NUMBER,
            placeholder: "#",
        },
    ], [resolveLanguageKey]);

    const listResolveLanguageKey = useCallback((key: string) => {
        if (key === "description") {
            return projectName ? resolveLanguageKey("description") : resolveLanguageKey("descriptionWithoutProject");
        }
        return resolveLanguageKey(key);
    }, [projectName, resolveLanguageKey],);

    return (
        <EntityListPage<Edifice>
            apiUrl="/api/realEstate/edifice"
            collectionName="edifices"
            accessModel="edifices"
            tableConfigKey="edifices"
            createPath={buildUrlWithExistingParams(window.location.href, "/realEstate/edifices/create")}
            createIcon={<IconBuildingPlus />}
            createLanguageKey="createEdifice"
            buildEditPath={buildEdificeEditPath}
            resolveLanguageKey={listResolveLanguageKey}
            headerTitle={buildPageTitle(resolveLanguageKey("title") as string, [projectName ?? ""])}
            extraFilters={{project: projectId ?? undefined}}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/edifices/center/sheetView/edificeSheetView.tsx"
            cardViewClassName={GRID_HIERARCHY}
            rowActionMenu={{allowMenuForCustomChildren: !!readFloors}}
            renderCard={(edifice, onDelete, onRestore) => (
                <EdificeCard
                    edifice={edifice}
                    projectId={projectId}
                    projectName={projectName}
                    onDelete={(row: Edifice | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(edifice)}
                />
            )}
            renderActionMenuChildren={(edifice, bindRowAction) => (
                <>
                    <ViewFloors edifice={edifice}/>
                    <ViewFloorsOverlay onAction={bindRowAction} />
                    <GenerateFloorsUnits onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction}) => {
                if (action === "viewFloorOverlay") {
                    return (
                        <FloorsOverlay
                            edificeMainImageId={entity.mainImage?._id}
                            edificeName={entity.name}
                            floorsCoordinates={entity.floorsCoordinates}
                            openFloorOverlay={true}
                            onClose={resetAction}
                        />
                    );
                }
                if (action === "generateFloorsUnits") {
                    return (
                        <GenerateFloorsUnitsDialog
                            open={true}
                            onClose={resetAction}
                            edificeId={entity._id}
                        />
                    );
                }
                return null;
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/edifices/index.tsx"),
    withDebug(true, true, ["edifices", "floors"]),
)(AllEdifices);
