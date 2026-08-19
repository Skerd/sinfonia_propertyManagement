import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {CheckCircle2} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Milestone} from "armonia/src/modules/propertyManagement/api/realEstate/private/milestone/milestone.dto.ts";

export const COMPLETE_MILESTONE_ACTION = "completeMilestone";

type CompleteMilestoneProps = WithLanguageType & {
    onAction: (action: string) => void;
    milestone?: Milestone;
};

function CompleteMilestone({onAction, milestone, resolveLanguageKey}: CompleteMilestoneProps) {
    const {write} = useAccess("milestones");
    const status = milestone?.status ?? "planned";
    const canComplete = !!write && !milestone?.deletedAt && (status === "in_progress" || status === "delayed");

    if (!canComplete) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(COMPLETE_MILESTONE_ACTION);}}>
            <CheckCircle2 className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/milestones/center/actions/complete.tsx"),
    withDebug(true, true, "milestones"),
)(CompleteMilestone);
