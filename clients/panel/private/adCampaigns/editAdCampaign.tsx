import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS} from "@coreModule/components/custom/inputs/objectIdChipsInput.tsx";
import {editAdCampaignFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/editAdCampaign.form.validator.ts";
import type {AdCampaign} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.dto.ts";
import type {EditAdCampaignFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.schema-def.ts";
import {getName} from "@coreModule/helpers/general/names.ts";

/** The four `#ObjectIdChipsInput` fields on the campaign form. */
const CHIP_FIELDS = ["recipients", "leadRecipients", "projects", "units"] as const;
type ChipField = (typeof CHIP_FIELDS)[number];

const chipLabelState = {
    loadedId: null as string | null,
    recipients: {current: {} as Record<string, string>},
    leadRecipients: {current: {} as Record<string, string>},
    projects: {current: {} as Record<string, string>},
    units: {current: {} as Record<string, string>},
};

/**
 * A chip needs a human label, and each of the four lists names its people or
 * things differently — a client user by `name`/`surname`, a lead by
 * `firstName`/`lastName`, a project or unit by `name`. Falling through to the
 * id would show a row of ObjectIds.
 */
function chipLabel(field: ChipField, entry: Record<string, any>): string {
    if (field === "recipients") return getName(entry) || entry.username || entry._id;
    if (field === "leadRecipients") {
        return [entry.firstName, entry.lastName].filter(Boolean).join(" ") || entry.email || entry._id;
    }
    return entry.name || entry._id;
}

export default createGenericEditPage<AdCampaign, EditAdCampaignFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/adCampaigns/editAdCampaign.tsx",
    model: "adcampaigns",
    apiUrl: "/api/realEstate/adCampaign",
    schema: editAdCampaignFormSchema,
    mapEntityData: (data) => ({
        ...data,
        includeClientUsers: !!data.includeClientUsers,
        includeLeads: !!data.includeLeads,
        recipients: data.recipients?.map((u) => u._id) ?? [],
        leadRecipients: data.leadRecipients?.map((l) => l._id) ?? [],
        projects: data.projects?.map((p) => p._id) ?? [],
        units: data.units?.map((u) => u._id) ?? [],
    } as any),
    buildFormExtras: (_entityId, _params, entity) => {
        // Switching to a different campaign must not inherit the previous
        // one's chip labels, which would mislabel ids the new one also holds.
        if (entity && chipLabelState.loadedId !== entity._id) {
            chipLabelState.loadedId = entity._id;
            for (const field of CHIP_FIELDS) chipLabelState[field].current = {};
        }
        const extras: Record<string, unknown> = {};
        for (const field of CHIP_FIELDS) {
            const rows = ((entity?.[field] as Record<string, any>[] | undefined) ?? []).filter((r) => !!r?._id);
            for (const row of rows) chipLabelState[field].current[row._id] = chipLabel(field, row);
            extras[field] = rows.map((row) => ({value: row._id, label: chipLabel(field, row)}));
        }
        return {
            ...extras,
            [FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS]: {
                recipients: chipLabelState.recipients,
                leadRecipients: chipLabelState.leadRecipients,
                projects: chipLabelState.projects,
                units: chipLabelState.units,
            },
        };
    },
    submitIcon: <Save />,
});
