import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_COLS_MAX_4, GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {IconUserPlus} from "@tabler/icons-react";
import type {Lead} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import LeadCard from "@propertyManagementModule/clients/panel/private/leads/center/cardView/leadCard.tsx";
import AddLeadActivity, {ADD_LEAD_ACTIVITY_ACTION} from "@propertyManagementModule/clients/panel/private/leads/center/actions/addActivity.tsx";
import AddLeadActivityDialog from "@propertyManagementModule/components/custom/leads/addLeadActivityDialog.tsx";

function buildLeadEditPath(lead: Lead) {
    const params = new URLSearchParams();
    params.set("leadId", lead._id);
    if (lead.firstName || lead.lastName) {
        params.set("leadName", [lead.firstName, lead.lastName].filter(Boolean).join(" "));
    }
    return `/realEstate/leads/edit?${params.toString()}`;
}

function AllLeads({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "projectInterest",
            label: resolveLanguageKey("fields.projectInterest") as string,
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/project/select",
        },
        {
            field: "unitInterest",
            label: resolveLanguageKey("fields.unitInterest") as string,
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/unit/select",
        },
        {
            field: "status",
            label: resolveLanguageKey("fields.status") as string,
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                {value: "new",         label: resolveLanguageKey("fields.!enums.status.new")         as string},
                {value: "contacted",   label: resolveLanguageKey("fields.!enums.status.contacted")   as string},
                {value: "qualified",   label: resolveLanguageKey("fields.!enums.status.qualified")   as string},
                {value: "proposal",    label: resolveLanguageKey("fields.!enums.status.proposal")    as string},
                {value: "negotiation", label: resolveLanguageKey("fields.!enums.status.negotiation") as string},
                {value: "won",         label: resolveLanguageKey("fields.!enums.status.won")         as string},
                {value: "lost",        label: resolveLanguageKey("fields.!enums.status.lost")        as string},
            ],
        },
        {
            field: "source",
            label: resolveLanguageKey("fields.source") as string,
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                {value: "website",   label: resolveLanguageKey("fields.!enums.source.website")   as string},
                {value: "referral",  label: resolveLanguageKey("fields.!enums.source.referral")  as string},
                {value: "social",    label: resolveLanguageKey("fields.!enums.source.social")    as string},
                {value: "event",     label: resolveLanguageKey("fields.!enums.source.event")     as string},
                {value: "cold_call", label: resolveLanguageKey("fields.!enums.source.cold_call") as string},
                {value: "walk_in",   label: resolveLanguageKey("fields.!enums.source.walk_in")   as string},
                {value: "other",     label: resolveLanguageKey("fields.!enums.source.other")     as string},
            ],
        },
        {
            field: "interest",
            label: resolveLanguageKey("fields.interest") as string,
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                {value: "partnerships",     label: resolveLanguageKey("fields.!enums.interest.partnerships")     as string},
                {value: "investments",      label: resolveLanguageKey("fields.!enums.interest.investments")      as string},
                {value: "platform_support", label: resolveLanguageKey("fields.!enums.interest.platform_support") as string},
                {value: "reservation",      label: resolveLanguageKey("fields.!enums.interest.reservation")      as string},
                {value: "other",            label: resolveLanguageKey("fields.!enums.interest.other")            as string},
            ],
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<Lead>
            apiUrl="/api/realEstate/lead"
            collectionName="leads"
            accessModel="leads"
            tableConfigKey="leads"
            createPath="/realEstate/leads/create"
            createIcon={<IconUserPlus className="h-4 w-4" />}
            createLanguageKey="createLead"
            buildEditPath={buildLeadEditPath}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/leads/center/sheetView/leadSheetView.tsx"
            cardViewClassName={cn(GRID_TRANSACTIONAL, GRID_COLS_MAX_4)}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderActionMenuChildren={(lead, bindRowAction) => (
                <AddLeadActivity lead={lead} onAction={bindRowAction} />
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action !== ADD_LEAD_ACTIVITY_ACTION) return null;
                return (
                    <AddLeadActivityDialog
                        open
                        onClose={resetAction}
                        lead={entity}
                        onSuccess={(updated?: Lead) => {
                            if (updated) listRef.current?.updateRow?.(updated._id, updated);
                            resetAction();
                        }}
                    />
                );
            }}
            renderCard={(lead, onDelete, onRestore, listRef) => (
                <LeadCard
                    lead={lead}
                    onDelete={(row: Lead | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(lead)}
                    onActivitySuccess={(updated?: Lead) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leads/index.tsx"),
    withDebug(true, true),
)(AllLeads);
