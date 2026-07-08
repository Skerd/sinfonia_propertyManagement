import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {History} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Lead} from "armonia/src/modules/propertyManagement/api/realEstate/private/lead/lead.dto.ts";

export const ADD_LEAD_ACTIVITY_ACTION = "addActivity";

type AddLeadActivityProps = WithLanguageType & {
    onAction: (action: string) => void;
    lead?: Lead;
};

function AddLeadActivity({onAction, lead, resolveLanguageKey}: AddLeadActivityProps) {
    const {write} = useAccess("leads");

    if (!write || lead?.deletedAt) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={(e) => {onAction(ADD_LEAD_ACTIVITY_ACTION);}}>
            <History className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/leads/center/actions/addActivity.tsx"),
    withDebug(true, true),
)(AddLeadActivity);
