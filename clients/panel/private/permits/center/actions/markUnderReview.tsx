import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Eye} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Permit} from "armonia/src/modules/propertyManagement/api/realEstate/private/permit/permit.dto.ts";

export const MARK_UNDER_REVIEW_PERMIT_ACTION = "markUnderReview";

type Props = WithLanguageType & {
    onAction: (action: string) => void;
    permit?: Permit;
};

function Action({onAction, permit, resolveLanguageKey}: Props) {
    const {write} = useAccess("permits");
    const status = permit?.status ?? "draft";
    const can = !!write && !permit?.deletedAt && status === "submitted";
    if (!can) return null;
    return (
        <DropdownMenuItem onClick={() => {onAction(MARK_UNDER_REVIEW_PERMIT_ACTION);}}>
            <Eye className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/permits/center/actions/markUnderReview.tsx"),
    withDebug(true, true),
)(Action);
