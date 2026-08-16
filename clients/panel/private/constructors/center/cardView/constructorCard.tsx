import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconBuildingCommunity, IconMail, IconPhone} from "@tabler/icons-react";
import {Constructor} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructor/constructor.dto.ts";
import ConstructorSheetView from "@propertyManagementModule/clients/panel/private/constructors/center/sheetView/constructorSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function constructorEditPath(c: Constructor) {
    const params = new URLSearchParams();
    params.set("constructorId", c._id);
    if (c.name) params.set("constructorName", c.name);
    return `/tenancy/systemSettings/constructors/edit?${params.toString()}`;
}

type ConstructorCardProps = WithLanguageType & {
    constructor: Constructor;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedConstructor?: Constructor, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Constructor> | null>;
};

function ConstructorCard({
    constructor,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: ConstructorCardProps) {
    return (
        <EntityCard
            resource="constructors"
            entity={constructor}
            fetchId={fetchId}
            singleUrl="/api/realEstate/constructor/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={constructorEditPath}
            Sheet={ConstructorSheetView}
            sheetEntityProp="constructor"
            deleteUrl="/api/realEstate/constructor"
            restoreUrl="/api/realEstate/constructor/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="name"
            innerRef={innerRef}
        >
            {({entity}) => {
                return (
                    <>
                        <EntityCard.Header
                            titlePath="name"
                            title={entity.name}
                            icon={<DisplayValue path="logo" type="avatar" value={entity.logo} />}
                        />
                        <EntityCard.Body>
                            <DisplayRow
                                icon={IconBuildingCommunity}
                                label={resolveLanguageKey("edifices")}
                                tooltip={resolveLanguageKey("edifices")}
                                path="edifices"
                                type="number"
                                show={true}
                                value={entity.edifices?.length ?? 0}
                            />
                            <DisplayRow
                                icon={IconPhone}
                                label={resolveLanguageKey("phoneNumber")}
                                tooltip={resolveLanguageKey("phoneNumber")}
                                path="phoneNumber"
                                type="phoneNumber"
                                value={entity.phoneNumber}
                            />
                            <DisplayRow
                                icon={IconMail}
                                label={resolveLanguageKey("email")}
                                tooltip={resolveLanguageKey("email")}
                                path="email"
                                type="email"
                                value={entity.email}
                            />
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/constructors/center/cardView/constructorCard.tsx"),
    withDebug(true, true)
)(ConstructorCard);
