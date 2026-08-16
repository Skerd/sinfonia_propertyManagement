import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Permit} from "armonia/src/modules/propertyManagement/api/realEstate/private/permit/permit.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {IconBuildingBank, IconCalendar, IconFolder, IconHash, IconShieldCheck} from "@tabler/icons-react";
import PermitSheetView from "@propertyManagementModule/clients/panel/private/permits/center/sheetView/permitSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import SubmitPermit, {SUBMIT_PERMIT_ACTION} from "@propertyManagementModule/clients/panel/private/permits/center/actions/submit.tsx";
import MarkUnderReviewPermit, {MARK_UNDER_REVIEW_PERMIT_ACTION} from "@propertyManagementModule/clients/panel/private/permits/center/actions/markUnderReview.tsx";
import ApprovePermit, {APPROVE_PERMIT_ACTION} from "@propertyManagementModule/clients/panel/private/permits/center/actions/approve.tsx";
import RejectPermit, {REJECT_PERMIT_ACTION} from "@propertyManagementModule/clients/panel/private/permits/center/actions/reject.tsx";
import RenewPermit, {RENEW_PERMIT_ACTION} from "@propertyManagementModule/clients/panel/private/permits/center/actions/renew.tsx";
import SubmitPermitDialog from "@propertyManagementModule/components/custom/permits/submitPermitDialog.tsx";
import MarkUnderReviewPermitDialog from "@propertyManagementModule/components/custom/permits/markUnderReviewPermitDialog.tsx";
import ApprovePermitDialog from "@propertyManagementModule/components/custom/permits/approvePermitDialog.tsx";
import RejectPermitDialog from "@propertyManagementModule/components/custom/permits/rejectPermitDialog.tsx";
import RenewPermitDialog from "@propertyManagementModule/components/custom/permits/renewPermitDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {ReactNode, RefObject} from "react";

type PermitCardProps = WithLanguageType & {
    permit: Permit;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: Permit, response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: Permit) => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Permit> | null>;
};

function buildEditPath(permit: Permit) {
    const params = new URLSearchParams();
    params.set("permitId", permit._id);
    if (permit.name) params.set("permitName", permit.name);
    if (permit.project?._id) params.set("projectId", permit.project._id);
    if (permit.project?.name) params.set("projectName", permit.project.name);
    return `/realEstate/permits/edit?${params.toString()}`;
}

function PermitCard({
    permit,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onActionSuccess,
    sheetOnly = false,
    innerRef,
}: PermitCardProps) {
    return (
        <EntityCard
            resource="permits"
            entity={permit}
            fetchId={fetchId}
            singleUrl="/api/realEstate/permit/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={buildEditPath}
            Sheet={PermitSheetView}
            sheetEntityProp="permit"
            deleteUrl="/api/realEstate/permit"
            restoreUrl="/api/realEstate/permit/restore"
            failedTitle=""
            failedDescription=""
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
            extraDialogs={({action, setAction, entity, setEntity}) => {
                const handleSuccess = (updated?: Permit) => {
                    if (updated) setEntity({...entity, ...updated});
                    onActionSuccess?.(updated);
                    setAction("");
                };
                return (
                    <>
                        {action === SUBMIT_PERMIT_ACTION && (
                            <SubmitPermitDialog open onClose={() => setAction("")} permit={entity} onSuccess={handleSuccess} />
                        )}
                        {action === MARK_UNDER_REVIEW_PERMIT_ACTION && (
                            <MarkUnderReviewPermitDialog open onClose={() => setAction("")} permit={entity} onSuccess={handleSuccess} />
                        )}
                        {action === APPROVE_PERMIT_ACTION && (
                            <ApprovePermitDialog open onClose={() => setAction("")} permit={entity} onSuccess={handleSuccess} />
                        )}
                        {action === REJECT_PERMIT_ACTION && (
                            <RejectPermitDialog open onClose={() => setAction("")} permit={entity} onSuccess={handleSuccess} />
                        )}
                        {action === RENEW_PERMIT_ACTION && (
                            <RenewPermitDialog open onClose={() => setAction("")} permit={entity} onSuccess={handleSuccess} />
                        )}
                    </>
                );
            }}
        >
            {({entity, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath="title"
                        title={entity.title}
                        subtitle={entity.name}
                        subtitlePath="name"
                        badges={
                            entity.status ? (
                                <DisplayValue
                                    path="status"
                                    type="enum"
                                    languageKeyCategory="fields.!enums.status"
                                    value={entity.status}
                                >
                                    {(formatted: ReactNode) => (
                                        <TooltipDisplayer tooltip={resolveLanguageKey("statusLabel") as string}>
                                            <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>
                                                {formatted}
                                            </Badge>
                                        </TooltipDisplayer>
                                    )}
                                </DisplayValue>
                            ) : undefined
                        }
                    >
                        <SubmitPermit permit={entity} onAction={setAction} />
                        <MarkUnderReviewPermit permit={entity} onAction={setAction} />
                        <ApprovePermit permit={entity} onAction={setAction} />
                        <RejectPermit permit={entity} onAction={setAction} />
                        <RenewPermit permit={entity} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconFolder}
                            label={resolveLanguageKey("fields.project")}
                            tooltip={resolveLanguageKey("fields.project")}
                            path="project"
                            value={entity.project?.name}
                        />
                        <DisplayRow
                            icon={IconShieldCheck}
                            label={resolveLanguageKey("fields.permitType")}
                            tooltip={resolveLanguageKey("fields.permitType")}
                            path="permitType"
                            type="enum"
                            languageKeyCategory="fields.!enums.permitType"
                            value={entity.permitType}
                        />
                        <DisplayRow
                            icon={IconBuildingBank}
                            label={resolveLanguageKey("fields.authority")}
                            tooltip={resolveLanguageKey("fields.authority")}
                            path="authority"
                            value={entity.authority}
                        />
                        <DisplayRow
                            icon={IconHash}
                            label={resolveLanguageKey("fields.referenceNumber")}
                            tooltip={resolveLanguageKey("fields.referenceNumber")}
                            path="referenceNumber"
                            value={entity.referenceNumber}
                        />
                        <DisplayRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.expiresAt")}
                            tooltip={resolveLanguageKey("fields.expiresAt")}
                            path="expiresAt"
                            type="date"
                            value={entity.expiresAt}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/permits/center/cardView/permitCard.tsx"),
    withDebug(true, true),
)(PermitCard);
