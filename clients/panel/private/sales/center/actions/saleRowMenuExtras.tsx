import {useAccess} from "@coreModule/helpers/context/accessContext.tsx";
import {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import ManualSaleClientEmails from "@propertyManagementModule/clients/panel/private/sales/center/actions/manualSaleClientEmails.tsx";
import UpdateHandover from "@propertyManagementModule/clients/panel/private/sales/center/actions/updateHandover.tsx";
import RecordTitleTransfer from "@propertyManagementModule/clients/panel/private/sales/center/actions/recordTitleTransfer.tsx";
import {canRecordTitleTransfer, canUpdateHandover} from "@propertyManagementModule/components/custom/sale/saleHandoverVisibility.ts";

type SaleRowMenuExtrasProps = {
    sale: Sale;
    onAction: (action: string) => void;
};

function hasWrite(write: unknown, field: string): boolean {
    if (write === true) return true;
    if (!write || typeof write !== "object") return false;
    return (write as Record<string, unknown>)[field] !== undefined;
}

/** Custom `ActionMenu` children. Standard View / Edit / Delete / Restore come from `ActionMenu`. */
export default function SaleRowMenuExtras({sale, onAction}: SaleRowMenuExtrasProps) {
    const {write: saleWrite} = useAccess("sales");
    const {write: packageWrite} = useAccess("handoverpackages");
    const isDeleted = sale.deletedAt != null || sale.deletedBy != null;
    const canTick = hasWrite(packageWrite, "items") || packageWrite === true;
    const canTitle = hasWrite(saleWrite, "titleTransferDate");

    return (
        <>
            {canTick && !isDeleted && canUpdateHandover(sale) && (
                <UpdateHandover onAction={onAction} />
            )}
            {canTitle && !isDeleted && canRecordTitleTransfer(sale) && (
                <RecordTitleTransfer onAction={onAction} />
            )}
            <ManualSaleClientEmails sale={sale} />
        </>
    );
}
