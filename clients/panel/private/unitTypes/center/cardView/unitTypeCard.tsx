import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {UnitType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unitType/unitType.dto.ts";
import {IconFolder, IconLock, IconStack2} from "@tabler/icons-react";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import UnitTypeSheetView from "@propertyManagementModule/clients/panel/private/unitTypes/center/sheetView/unitTypeSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function unitTypeEditPath(unitType: UnitType) {
    const params = new URLSearchParams();
    params.set("unitTypeId", unitType._id);
    if (unitType.name) params.set("unitTypeName", unitType.name);
    return `/tenancy/systemSettings/unitTypes/edit?${params.toString()}`;
}

type UnitTypeCardProps = WithLanguageType & {
    unitType: UnitType;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedUnitType?: UnitType, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<UnitType> | null>;
};

function UnitTypeCard({
    unitType,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: UnitTypeCardProps) {
    return (
        <EntityCard
            resource="unitTypes"
            entity={unitType}
            fetchId={fetchId}
            singleUrl="/api/realEstate/unitType/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={unitTypeEditPath}
            Sheet={UnitTypeSheetView}
            sheetEntityProp="unitType"
            deleteUrl="/api/realEstate/unitType"
            restoreUrl="/api/realEstate/unitType/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="name"
            innerRef={innerRef}
        >
            {({entity}) => (
                <>
                    <EntityCard.Header
                        titlePath="name"
                        title={entity.name}
                        icon={
                            <DisplayValue path="icon" type="icon" value={entity.icon} />
                        }
                    />
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconStack2}
                            label={resolveLanguageKey("category")}
                            tooltip={resolveLanguageKey("category")}
                            path="category.name"
                            value={entity.category?.name}
                        />
                        <DisplayRow
                            icon={IconFolder}
                            label={resolveLanguageKey("group")}
                            tooltip={resolveLanguageKey("group")}
                            path="group"
                            value={entity.group}
                        />
                        <DisplayRow
                            icon={IconLock}
                            label={resolveLanguageKey("isPrivate")}
                            tooltip={resolveLanguageKey("isPrivate")}
                            path="isPrivate"
                            type="boolean"
                            value={entity.isPrivate}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/unitTypes/center/cardView/unitTypeCard.tsx"),
    withDebug(true, true),
)(UnitTypeCard);
