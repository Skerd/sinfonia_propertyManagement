import { compose } from "redux";
import withLanguage, { type WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import { DropdownMenuItem } from "@coreModule/components/ui/dropdown-menu.tsx";
import { downloadExpenditureReportFromUnitCostDataPdf } from "@propertyManagementModule/components/custom/unitCosts/expenditureCostTemplatePdf.ts";

/** Same language bundle as {@link unitCostSheetView.tsx} so PDF column/category strings resolve. */
const UNIT_COST_SHEET_VIEW_LANG_PATH =
    "src/modules/propertyManagement/clients/panel/private/unitCosts/center/sheetView/unitCostSheetView.tsx";

export type UnitCostInvoicePdfActionMenuItemOwnProps = {
    entity: Record<string, unknown>;
};

function UnitCostInvoicePdfActionMenuItemInner({
    entity,
    resolveLanguageKey,
}: UnitCostInvoicePdfActionMenuItemOwnProps & WithLanguageType) {
    return (
        <DropdownMenuItem
            onSelect={(e: { preventDefault: () => void }) => {
                e.preventDefault();
                void downloadExpenditureReportFromUnitCostDataPdf(entity, (k) => String(resolveLanguageKey(k)));
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
