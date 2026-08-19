import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {UserPlus} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Snag} from "armonia/src/modules/propertyManagement/api/realEstate/private/snag/snag.dto.ts";

export const ASSIGN_SNAG_ACTION = "assign";

type AssignSnagProps = WithLanguageType & {
    onAction: (action: string) => void;
    snag?: Snag;
};

function AssignSnag({onAction, snag, resolveLanguageKey}: AssignSnagProps) {
    const {write} = useAccess("snags");
    const status = snag?.status ?? "open";
    const canAssign = !!write && !snag?.deletedAt && (status === "open" || status === "in_progress");

    if (!canAssign) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(ASSIGN_SNAG_ACTION);}}>
            <UserPlus className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/snags/center/actions/assign.tsx"),
    withDebug(true, true, "snags"),
)(AssignSnag);
