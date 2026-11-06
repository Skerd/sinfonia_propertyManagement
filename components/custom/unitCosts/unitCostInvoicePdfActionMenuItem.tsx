import { compose } from "redux";
import { useState } from "react";
import useHttpRequest, { type HttpRequest } from "@coreModule/helpers/hooks/useHttpRequest.ts";
import type { BasicCompanyInfoFormResponseType } from "armonia/src/modules/core/api/company/private/company/company.dto.ts";
import withLanguage, { type WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import { DropdownMenuItem } from "@coreModule/components/ui/dropdown-menu.tsx";
import { downloadExpenditureReportFromUnitCostDataPdf } from "@propertyManagementModule/components/custom/unitCosts/expenditureCostTemplatePdf.ts";

/** Same language bundle as {@link unitCostSheetView.tsx} so PDF column/category strings resolve. */
const UNIT_COST_SHEET_VIEW_LANG_PATH =
    "src/modules/propertyManagement/clients/panel/private/unitCosts/center/sheetView/unitCostSheetView.tsx";

const COMPANY_INFO_REQUEST: HttpRequest = { method: "get", url: "/api/company/basicInfo" };

export type UnitCostInvoicePdfActionMenuItemOwnProps = {
    entity: Record<string, unknown>;
};

function UnitCostInvoicePdfActionMenuItemInner({
    entity,
    resolveLanguageKey,
}: UnitCostInvoicePdfActionMenuItemOwnProps & WithLanguageType) {
    // The letterhead (company name and logo) is loaded on click, then the PDF is built.
    const [companyCount, setCompanyCount] = useState(0);
    useHttpRequest<BasicCompanyInfoFormResponseType>(COMPANY_INFO_REQUEST, {}, companyCount, true, {
        success: (company) => {
            void downloadExpenditureReportFromUnitCostDataPdf(entity, (k) => String(resolveLanguageKey(k)), { company });
        },
        error: () => {
            void downloadExpenditureReportFromUnitCostDataPdf(entity, (k) => String(resolveLanguageKey(k)));
        },
    });
    return (
        <DropdownMenuItem
            onSelect={(e: { preventDefault: () => void }) => {
                e.preventDefault();
                setCompanyCount((count) => count + 1);
            }}
        >
            {String(resolveLanguageKey("template.downloadFilled"))}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage(UNIT_COST_SHEET_VIEW_LANG_PATH),
    withDebug(true, true, "unitCosts"),
)(UnitCostInvoicePdfActionMenuItemInner);
