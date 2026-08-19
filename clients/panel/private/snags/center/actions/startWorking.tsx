import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Play} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Snag} from "armonia/src/modules/propertyManagement/api/realEstate/private/snag/snag.dto.ts";

export const START_WORKING_SNAG_ACTION = "startWorking";

type StartWorkingSnagProps = WithLanguageType & {
    onAction: (action: string) => void;
    snag?: Snag;
};

function StartWorkingSnag({onAction, snag, resolveLanguageKey}: StartWorkingSnagProps) {
    const {write} = useAccess("snags");
    const status = snag?.status ?? "open";
    const canStart = !!write && !snag?.deletedAt && status === "open" && !!snag?.assignedTo;

    if (!canStart) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(START_WORKING_SNAG_ACTION);}}>
            <Play className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/snags/center/actions/startWorking.tsx"),
    withDebug(true, true, "snags"),
)(StartWorkingSnag);
