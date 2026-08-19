import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Avatar, AvatarFallback} from "@coreModule/components/ui/avatar.tsx";
import {IconBuilding, IconCalendar, IconCurrencyDollar, IconDoor, IconPhone, IconUser} from "@tabler/icons-react";
import {Lead} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import LeadSheetView from "@propertyManagementModule/clients/panel/private/leads/center/sheetView/leadSheetView.tsx";
import AddLeadActivity, {ADD_LEAD_ACTIVITY_ACTION} from "@propertyManagementModule/clients/panel/private/leads/center/actions/addActivity.tsx";
import AddLeadActivityDialog from "@propertyManagementModule/components/custom/leads/addLeadActivityDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function leadEditPath(lead: Lead) {
    const params = new URLSearchParams();
    params.set("leadId", lead._id);
    const fullName = [lead.firstName, lead.lastName].filter(Boolean).join(" ");
    if (fullName) params.set("leadName", fullName);
    return `/realEstate/leads/edit?${params.toString()}`;
}

function getInitials(lead: Lead): string {
    const f = lead.firstName?.[0] ?? "";
    const l = lead.lastName?.[0] ?? "";
    return (f + l).toUpperCase() || "?";
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
                return (
                    <>
                        <EntityCard.Header
                            titlePath="firstName"
                            title={fullName || entity.name}
                            icon={
                                <Avatar className="size-8">
                                    <AvatarFallback className="text-xs">{getInitials(entity)}</AvatarFallback>
                                </Avatar>
                            }
                        >
                            <AddLeadActivity lead={entity} onAction={setAction} />
                        </EntityCard.Header>
                        <EntityCard.Body>
                            <DisplayRow
                                icon={IconUser}
                                label={resolveLanguageKey("statusLabel")}
                                tooltip={resolveLanguageKey("statusLabel")}
                                path="status"
                                type="enum"
                                languageKeyCategory="status"
                                value={entity.status}
                            />
                            <DisplayRow
                                icon={IconPhone}
                                label={resolveLanguageKey("phone")}
                                tooltip={resolveLanguageKey("phone")}
                                path="phone"
                                type="phoneNumber"
                                value={entity.phone}
                            />
                            <DisplayRow
                                icon={IconBuilding}
                                label={resolveLanguageKey("projectInterest")}
                                tooltip={resolveLanguageKey("projectInterest")}
                                path="projectInterest.name"
                                value={entity.projectInterest?.name}
                            />
                            <DisplayRow
                                icon={IconDoor}
                                label={resolveLanguageKey("unitInterest")}
                                tooltip={resolveLanguageKey("unitInterest")}
                                path="unitInterest"
                                value={entity.unitInterest?.name ?? entity.unitInterest?.unitNumber}
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
