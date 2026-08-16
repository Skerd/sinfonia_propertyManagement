import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {WorkPackage} from "armonia/src/modules/propertyManagement/api/realEstate/private/workPackage/workPackage.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/workPackages/center/sheetView/workPackageSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function workPackageEditPath(workPackage: WorkPackage) {
    const params = new URLSearchParams();
    params.set("workPackageId", workPackage._id);
    if (workPackage.name) params.set("workPackageName", workPackage.name);
    return `/realEstate/workPackages/edit?${params.toString()}`;
}

type WorkPackageCardProps = WithLanguageType & {
    entity: WorkPackage;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: WorkPackage, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<WorkPackage> | null>;
};

function WorkPackageCard({
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: WorkPackageCardProps) {
    return (
        <EntityCard
            resource="workpackages"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/workPackage/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={workPackageEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/workPackage"
            restoreUrl="/api/realEstate/workPackage/restore"
            failedTitle=""
            failedDescription=""
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => (
                <EntityCard.Header
                    titlePath="title"
                    title={row.title}
                    subtitle={row.name}
                    subtitlePath="name"
                    badges={row.status ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{row.status}</Badge>
                    ) : null}
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/workPackages/center/cardView/workPackageCard.tsx"),
    withDebug(true, true),
)(WorkPackageCard);
