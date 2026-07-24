import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {AlertTriangle} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Milestone} from "armonia/src/modules/propertyManagement/api/realEstate/private/milestone/milestone.dto.ts";

export const MARK_DELAYED_MILESTONE_ACTION = "markDelayedMilestone";

type MarkDelayedMilestoneProps = WithLanguageType & {
    onAction: (action: string) => void;
    milestone?: Milestone;
};

function MarkDelayedMilestone({onAction, milestone, resolveLanguageKey}: MarkDelayedMilestoneProps) {
    const {write} = useAccess("milestones");
    const status = milestone?.status ?? "planned";
    const canMark = !!write && !milestone?.deletedAt && (status === "planned" || status === "in_progress");

    if (!canMark) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(MARK_DELAYED_MILESTONE_ACTION);}}>
            <AlertTriangle className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/milestones/center/actions/markDelayed.tsx"),
    withDebug(true, true),
)(MarkDelayedMilestone);
