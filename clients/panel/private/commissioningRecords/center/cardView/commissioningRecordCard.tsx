import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {CommissioningRecord} from "armonia/src/modules/propertyManagement/api/realEstate/private/commissioningRecord/commissioningRecord.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/commissioningRecords/center/sheetView/commissioningRecordSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function commissioningRecordEditPath(entity: CommissioningRecord) {
    const params = new URLSearchParams();
    params.set("commissioningRecordId", entity._id);
    if (entity.name) params.set("commissioningRecordName", entity.name);
    return `/realEstate/commissioningRecords/edit?${params.toString()}`;
}

type CommissioningRecordCardProps = WithLanguageType & {
    entity: CommissioningRecord;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: CommissioningRecord, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<CommissioningRecord> | null>;
};

function CommissioningRecordCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: CommissioningRecordCardProps) {
    return (
        <EntityCard
            resource="commissioningrecords"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/commissioningRecord/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={commissioningRecordEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/commissioningRecord"
            restoreUrl="/api/realEstate/commissioningRecord/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
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
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{String(resolveLanguageKey(`status.${row.status}`, true) || resolveLanguageKey(`statuses.${row.status}`, true) || row.status)}</Badge>
                    ) : null}
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/commissioningRecords/center/cardView/commissioningRecordCard.tsx"),
    withDebug(true, true),
)(CommissioningRecordCard);
