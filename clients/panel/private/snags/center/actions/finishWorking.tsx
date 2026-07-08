import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {CheckCircle2} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Snag} from "armonia/src/modules/propertyManagement/api/realEstate/private/snag/snag.dto.ts";

export const FINISH_WORKING_SNAG_ACTION = "finishWorking";

type FinishWorkingSnagProps = WithLanguageType & {
    onAction: (action: string) => void;
    snag?: Snag;
};

function FinishWorkingSnag({onAction, snag, resolveLanguageKey}: FinishWorkingSnagProps) {
    const {write} = useAccess("snags");
    const status = snag?.status ?? "open";
    const canFinish = !!write && !snag?.deletedAt && status === "in_progress";

    if (!canFinish) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(FINISH_WORKING_SNAG_ACTION);}}>
            <CheckCircle2 className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/snags/center/actions/finishWorking.tsx"),
    withDebug(true, true),
)(FinishWorkingSnag);
