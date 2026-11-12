import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {HandoverPackage} from "armonia/src/modules/propertyManagement/api/realEstate/private/handoverPackage/handoverPackage.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import Sheet from "@propertyManagementModule/clients/panel/private/handoverPackages/center/sheetView/handoverPackageSheetView.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import {IconListCheck, IconMapPin} from "@tabler/icons-react";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function handoverPackageEditPath(entity: HandoverPackage) {
    const params = new URLSearchParams();
    params.set("handoverPackageId", entity._id);
    if (entity.name) params.set("handoverPackageName", entity.name);
    return `/tenancy/systemSettings/handoverPackages/edit?${params.toString()}`;
}

type HandoverPackageCardProps = WithLanguageType & {
    entity: HandoverPackage;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: HandoverPackage, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<HandoverPackage> | null>;
};

function HandoverPackageCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: HandoverPackageCardProps) {
    return (
        <EntityCard
            resource="handoverpackages"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/handoverPackage/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={handoverPackageEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/handoverPackage"
            restoreUrl="/api/realEstate/handoverPackage/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => {
                // The record the package hands over, named at its own level ("Unit: A-101") (UX-02).
                const target = row.unit ?? row.floor ?? row.edifice ?? row.project;
                const targetPath = row.unit ? "unit" : row.floor ? "floor" : row.edifice ? "edifice" : "project";
                return (
                    <>
                        <EntityCard.Header titlePath="title" title={row.title} subtitle={row.name} subtitlePath="name" />
                        <EntityCard.Body>
                            {target.name ? (
                                <EntityCardRow
                                    icon={IconMapPin}
                                    label={String(resolveLanguageKey(`scopes.${row.scope}`))}
                                    tooltip={String(resolveLanguageKey(`scopes.${row.scope}`))}
                                    path={targetPath}
                                    value={target.name}
                                />
                            ) : null}
                            {row.items.length > 0 ? (
                                <EntityCardRow
                                    icon={IconListCheck}
                                    label={resolveLanguageKey("itemCount")}
                                    tooltip={resolveLanguageKey("itemCount")}
                                    path="items"
                                    type="number"
                                    value={row.items.length}
                                />
                            ) : null}
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/handoverPackages/center/cardView/handoverPackageCard.tsx"),
    withDebug(true, true, "handoverpackages"),
)(HandoverPackageCard);
