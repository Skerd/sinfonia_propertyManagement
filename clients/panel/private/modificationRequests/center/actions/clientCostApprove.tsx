import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {DollarSign} from "lucide-react";

type ClientCostApproveProps = WithLanguageType & {
    onAction: (action: string) => void;
};

function ClientCostApprove({onAction, resolveLanguageKey}: ClientCostApproveProps) {
    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAction("clientCostApprove"); }}>
            <DollarSign size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/modificationRequests/center/actions/clientCostApprove.tsx"),
    withDebug(true, true, "modificationRequests"),
)(ClientCostApprove);
