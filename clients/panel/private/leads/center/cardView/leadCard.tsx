import {compose} from "redux";
import withLanguage, {type ResolveLanguageKey, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconBuilding, IconCalendar, IconCurrencyDollar, IconDoor, IconPhone, IconUser} from "@tabler/icons-react";
import {Lead} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import LeadSheetView from "@propertyManagementModule/clients/panel/private/leads/center/sheetView/leadSheetView.tsx";
import AddLeadActivity, {ADD_LEAD_ACTIVITY_ACTION} from "@propertyManagementModule/clients/panel/private/leads/center/actions/addActivity.tsx";
import AddLeadActivityDialog from "@propertyManagementModule/components/custom/leads/addLeadActivityDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Separator} from "@coreModule/components/ui/separator.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {
    CARD_INFO_ROWS_TWO_COL_CLASS,
    STATUS_BADGE_DANGER,
    STATUS_BADGE_INFO,
    STATUS_BADGE_NEUTRAL,
    STATUS_BADGE_SUCCESS,
    STATUS_BADGE_WARNING,
} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {ReactNode, RefObject} from "react";

function leadEditPath(lead: Lead) {
    const params = new URLSearchParams();
    params.set("leadId", lead._id);
    const fullName = [lead.firstName, lead.lastName].filter(Boolean).join(" ");
    if (fullName) params.set("leadName", fullName);
    return `/realEstate/leads/edit?${params.toString()}`;
}

function leadStatusBadgeClass(status: string): string {
    switch (status) {
        case "new":
            return STATUS_BADGE_INFO;
        case "contacted":
            return STATUS_BADGE_NEUTRAL;
        case "qualified":
            return STATUS_BADGE_INFO;
        case "proposal":
        case "negotiation":
            return STATUS_BADGE_WARNING;
        case "won":
            return STATUS_BADGE_SUCCESS;
        case "lost":
            return STATUS_BADGE_DANGER;
        default:
            return STATUS_BADGE_NEUTRAL;
    }
}

function leadSourceBadgeClass(source: string): string {
    switch (source) {
        case "website":
        case "chat":
            return STATUS_BADGE_INFO;
        case "referral":
            return STATUS_BADGE_SUCCESS;
        case "social":
        case "event":
            return STATUS_BADGE_WARNING;
        case "cold_call":
        case "walk_in":
        case "other":
        default:
            return STATUS_BADGE_NEUTRAL;
    }
}

function LeadCardBadges({
    entity,
    resolveLanguageKey,
}: {
    entity: Lead;
    resolveLanguageKey: ResolveLanguageKey;
}): ReactNode {
    const status = entity.status;
    const source = entity.source;
    const projectName = entity.projectInterest?.name;
    const unitLabel = entity.unitInterest?.name ?? entity.unitInterest?.unitNumber;

    if (!status && !source && !projectName && unitLabel == null) return null;

    return (
        <>
            {status ? (
                <DisplayValue path="status" value={status}>
                    {() => (
                        <Badge variant="outline" className={cn("text-xs", leadStatusBadgeClass(status))}>
                            {String(resolveLanguageKey(`status.${status}`, true) || status)}
                        </Badge>
                    )}
                </DisplayValue>
            ) : null}
            {source ? (
                <DisplayValue path="source" value={source}>
                    {() => (
                        <Badge variant="outline" className={cn("text-xs", leadSourceBadgeClass(source))}>
                            {String(resolveLanguageKey(`source.${source}`, true) || source)}
                        </Badge>
                    )}
                </DisplayValue>
            ) : null}
            {projectName ? (
                <DisplayValue path="projectInterest" value={entity.projectInterest}>
                    {() => (
                        <Badge variant="secondary" className={cn("text-xs gap-1", STATUS_BADGE_NEUTRAL)}>
                            <IconBuilding className="size-3" aria-hidden />
                            {projectName}
                        </Badge>
                    )}
                </DisplayValue>
            ) : null}
            {unitLabel != null && unitLabel !== "" ? (
                <DisplayValue path="unitInterest" value={entity.unitInterest}>
                    {() => (
                        <Badge variant="secondary" className={cn("text-xs gap-1", STATUS_BADGE_NEUTRAL)}>
                            <IconDoor className="size-3" aria-hidden />
                            {String(unitLabel)}
                        </Badge>
                    )}
                </DisplayValue>
            ) : null}
        </>
    );
}

type LeadCardProps = WithLanguageType & {
    lead: Lead;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deletedLead?: Lead, response?: DeletedData) => void;
    onRestore?: () => void;
    onActivitySuccess?: (updated?: Lead) => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Lead> | null>;
};

function LeadCard({
    lead,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    onActivitySuccess,
    sheetOnly = false,
    innerRef,
}: LeadCardProps) {
    return (
        <EntityCard
            resource="leads"
            entity={lead}
            fetchId={fetchId}
            singleUrl="/api/realEstate/lead/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={leadEditPath}
            Sheet={LeadSheetView}
            sheetEntityProp="lead"
            deleteUrl="/api/realEstate/lead"
            restoreUrl="/api/realEstate/lead/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="firstName"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
            extraDialogs={({action, setAction, entity}) => (
                <>
                    {action === ADD_LEAD_ACTIVITY_ACTION && (
                        <AddLeadActivityDialog
                            open
                            onClose={() => setAction("")}
                            lead={entity}
                            onSuccess={(updated?: Lead) => {
                                onActivitySuccess?.(updated);
                                setAction("");
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity, setAction}) => {
                const fullName = [entity.firstName, entity.lastName].filter(Boolean).join(" ");
                const projectName = entity.projectInterest?.name;
                const unitLabel = entity.unitInterest?.name ?? entity.unitInterest?.unitNumber;
                const hasBadges = Boolean(
                    entity.status || entity.source || projectName || (unitLabel != null && unitLabel !== ""),
                );
                return (
                    <>
                        <EntityCard.Header
                            titlePath="firstName"
                            title={fullName || entity.name}
                            badges={
                                hasBadges ? (
                                    <LeadCardBadges entity={entity} resolveLanguageKey={resolveLanguageKey} />
                                ) : undefined
                            }
                        >
                            <AddLeadActivity lead={entity} onAction={setAction} />
                        </EntityCard.Header>
                        {hasBadges && (
                            <Separator className="-mx-(--density-pad) w-auto self-stretch" />
                        )}
                        <EntityCard.Body className={CARD_INFO_ROWS_TWO_COL_CLASS}>
                            <DisplayRow
                                icon={IconPhone}
                                label={resolveLanguageKey("phone")}
                                tooltip={resolveLanguageKey("phone")}
                                path="phone"
                                type="phoneNumber"
                                value={entity.phone}
                            />
                            <DisplayRow
                                icon={IconCurrencyDollar}
                                label={resolveLanguageKey("budget")}
                                tooltip={resolveLanguageKey("budget")}
                                path="budget"
                                type="currency"
                                value={{amount: entity.budget, currency: entity.budgetCurrency}}
                            />
                            <DisplayRow
                                icon={IconUser}
                                label={resolveLanguageKey("assignedTo")}
                                tooltip={resolveLanguageKey("assignedTo")}
                                path="assignedTo"
                                type="user"
                                value={entity.assignedTo}
                            />
                            <DisplayRow
                                icon={IconCalendar}
                                label={resolveLanguageKey("followUpDate")}
                                tooltip={resolveLanguageKey("followUpDate")}
                                path="followUpDate"
                                type="date"
                                value={entity.followUpDate}
                            />
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leads/center/cardView/leadCard.tsx"),
    withDebug(true, true, "leads"),
)(LeadCard);
