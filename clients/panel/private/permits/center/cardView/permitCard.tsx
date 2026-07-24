import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Permit} from "armonia/src/modules/propertyManagement/api/realEstate/private/permit/permit.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {withDeletedDrawer} from "@coreModule/helpers/hocs/withDeletedDrawer.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconBuildingBank, IconCalendar, IconFolder, IconHash, IconShieldCheck} from "@tabler/icons-react";
import PermitSheetView from "@propertyManagementModule/clients/panel/private/permits/center/sheetView/permitSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS, CARD_INFO_ROWS_CLASS, STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
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

type PermitCardProps = WithLanguageType & {
    permit: Permit;
    onDelete?: (deleted?: Permit, response?: DeletedData) => void;
    onRestore?: () => void;
    onActionSuccess?: (updated?: Permit) => void;
    hideActions?: boolean;
};

function buildEditPath(permit: Permit) {
    const params = new URLSearchParams();
    params.set("permitId", permit._id);
    if (permit.name) params.set("permitName", permit.name);
    if (permit.project?._id) params.set("projectId", permit.project._id);
    if (permit.project?.name) params.set("projectName", permit.project.name);
    return `/realEstate/permits/edit?${params.toString()}`;
}

function formatDate(value?: string) {
    if (!value) return undefined;
    try {
        return new Date(value).toLocaleDateString();
    } catch {
        return value;
    }
}

function getEnumLabel(resolveLanguageKey: (key: string) => unknown, category: string, value?: string) {
    if (!value) return undefined;
    return resolveLanguageKey(`fields.!enums.${category}.${value}`) as string;
}

function PermitCard({
    permit: permitProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    onActionSuccess,
    hideActions = false,
}: PermitCardProps) {
    const {action, setAction, entity: permit, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: permitProp,
        onDeleteProp,
        onRestoreProp,
    });

    const handleActionSuccess = (updated?: Permit) => {
        if (updated) setEntity(updated);
        onActionSuccess?.(updated);
        setAction("");
    };

    const {read, write, restore} = useAccess("permits");

    if (hideAfterDeletion || !restore) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const editPath = buildEditPath(permit);

    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                <EntityTextCardHeader
                    title={!!read?.title ? permit.title : null}
                    subtitle={!!read?.name && !!permit.name ? permit.name : undefined}
                    badges={
                        <>
                            {!!read?.status && !!permit.status && (
                                <TooltipDisplayer tooltip={resolveLanguageKey("statusLabel") as string}>
                                    <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>
                                        {getEnumLabel(resolveLanguageKey, "status", permit.status)}
                                    </Badge>
                                </TooltipDisplayer>
                            )}
                        </>
                    }
                    hideActions={hideActions}
                    actionMenu={
                        <ActionMenu
                            accessModel="permits"
                            deletedData={permit}
                            onAction={(a: string) => setAction(a)}
                            editPath={editPath}
                            allowMenuForCustomChildren={!!write && !permit.deletedAt}
                        >
                            <SubmitPermit permit={permit} onAction={(a: string) => setAction(a)} />
                            <MarkUnderReviewPermit permit={permit} onAction={(a: string) => setAction(a)} />
                            <ApprovePermit permit={permit} onAction={(a: string) => setAction(a)} />
                            <RejectPermit permit={permit} onAction={(a: string) => setAction(a)} />
                            <RenewPermit permit={permit} onAction={(a: string) => setAction(a)} />
                        </ActionMenu>
                    }
                />
                <Separator />
                <div className={CARD_BODY_CLASS}>
                    <div className={CARD_INFO_ROWS_CLASS}>
                        <InfoRow
                            icon={IconFolder}
                            label={resolveLanguageKey("fields.project")}
                            show={!!read?.project}
                            value={permit.project?.name}
                        />
                        <InfoRow
                            icon={IconShieldCheck}
                            label={resolveLanguageKey("fields.permitType")}
                            show={!!read?.permitType}
                            value={getEnumLabel(resolveLanguageKey, "permitType", permit.permitType)}
                        />
                        <InfoRow
                            icon={IconBuildingBank}
                            label={resolveLanguageKey("fields.authority")}
                            show={!!read?.authority && !!permit.authority}
                            value={permit.authority}
                        />
                    </div>
                    <Separator />
                    <div className={CARD_INFO_ROWS_CLASS}>
                        <InfoRow
                            icon={IconHash}
                            label={resolveLanguageKey("fields.referenceNumber")}
                            show={!!read?.referenceNumber && !!permit.referenceNumber}
                            value={permit.referenceNumber}
                        />
                        <InfoRow
                            icon={IconCalendar}
                            label={resolveLanguageKey("fields.expiresAt")}
                            show={!!read?.expiresAt && !!permit.expiresAt}
                            value={formatDate(permit.expiresAt)}
                        />
                    </div>
                </div>
            </EntityCardShell>

            {!!action && (
                <>
                    {action === "view" && (
                        <PermitSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            permit={permit}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="permits"
                            deleteId={permit._id}
                            openAlert={action === "delete"}
                            name={read?.title && permit.title}
                            confirmName={read?.title && permit.title}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/permit"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="permits"
                            deleteId={permit._id}
                            openAlert={action === "restore"}
                            name={read?.title && permit.title}
                            confirmName={read?.title && permit.title}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/permit/restore"
                        />
                    )}
                    {action === SUBMIT_PERMIT_ACTION && (
                        <SubmitPermitDialog open onClose={() => setAction("")} permit={permit} onSuccess={handleActionSuccess} />
                    )}
                    {action === MARK_UNDER_REVIEW_PERMIT_ACTION && (
                        <MarkUnderReviewPermitDialog open onClose={() => setAction("")} permit={permit} onSuccess={handleActionSuccess} />
                    )}
                    {action === APPROVE_PERMIT_ACTION && (
                        <ApprovePermitDialog open onClose={() => setAction("")} permit={permit} onSuccess={handleActionSuccess} />
                    )}
                    {action === REJECT_PERMIT_ACTION && (
                        <RejectPermitDialog open onClose={() => setAction("")} permit={permit} onSuccess={handleActionSuccess} />
                    )}
                    {action === RENEW_PERMIT_ACTION && (
                        <RenewPermitDialog open onClose={() => setAction("")} permit={permit} onSuccess={handleActionSuccess} />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    (Component: any) => withDeletedDrawer(Component, (props: any) => props.permit),
    withLanguage("src/modules/propertyManagement/clients/panel/private/permits/center/cardView/permitCard.tsx"),
    withDebug(true, true),
)(PermitCard);
