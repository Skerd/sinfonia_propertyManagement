import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Play} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Milestone} from "armonia/src/modules/propertyManagement/api/realEstate/private/milestone/milestone.dto.ts";

export const START_MILESTONE_ACTION = "startMilestone";

type StartMilestoneProps = WithLanguageType & {
    onAction: (action: string) => void;
    milestone?: Milestone;
};

function StartMilestone({onAction, milestone, resolveLanguageKey}: StartMilestoneProps) {
    const {write} = useAccess("milestones");
    const status = milestone?.status ?? "planned";
    const canStart = !!write && !milestone?.deletedAt && status === "planned";

    if (!canStart) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={() => {onAction(START_MILESTONE_ACTION);}}>
            <Play className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/milestones/center/actions/start.tsx"),
    withDebug(true, true),
)(StartMilestone);
