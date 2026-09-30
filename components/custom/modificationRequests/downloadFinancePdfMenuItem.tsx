import {compose} from "redux";
import {Download} from "lucide-react";
import withLanguage, {type WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import type {ModificationRequest} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.dto.ts";
import {downloadModificationRequestFinancePdf} from "@propertyManagementModule/components/custom/modificationRequests/modificationRequestFinancePdf.ts";

const CARD_LANG_PATH =
    "src/modules/propertyManagement/clients/panel/private/modificationRequests/center/cardView/modificationRequestCard.tsx";

type DownloadFinancePdfMenuItemProps = WithLanguageType & {
    request: ModificationRequest;
};

function DownloadFinancePdfMenuItem({request, resolveLanguageKey}: DownloadFinancePdfMenuItemProps) {
    if (!request.financeDetails) return null;

    return (
        <DropdownMenuItem
            onSelect={() => {
                void downloadModificationRequestFinancePdf(request, (key) => String(resolveLanguageKey(key)));
            }}
        >
            <Download size={16} />
            {String(resolveLanguageKey("downloadFinancePdf"))}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage(CARD_LANG_PATH),
    withDebug(true, true, "modificationRequests"),
)(DownloadFinancePdfMenuItem);
