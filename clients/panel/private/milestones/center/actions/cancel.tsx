import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {XCircle} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Milestone} from "armonia/src/modules/propertyManagement/api/realEstate/private/milestone/milestone.dto.ts";

export const CANCEL_MILESTONE_ACTION = "cancelMilestone";

type CancelMilestoneProps = WithLanguageType & {
    onAction: (action: string) => void;
    milestone?: Milestone;
};

function CancelMilestone({onAction, milestone, resolveLanguageKey}: CancelMilestoneProps) {
    const {write} = useAccess("milestones");
    const status = milestone?.status ?? "planned";
    const canCancel = !!write && !milestone?.deletedAt && status !== "completed" && status !== "cancelled";

    if (!canCancel) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(CANCEL_MILESTONE_ACTION);}}>
            <XCircle className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/milestones/center/actions/cancel.tsx"),
    withDebug(true, true, "milestones"),
)(CancelMilestone);
