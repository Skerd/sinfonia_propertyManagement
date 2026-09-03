import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import ManualSaleClientEmails from "@propertyManagementModule/clients/panel/private/sales/center/actions/manualSaleClientEmails.tsx";
import CompleteHandover from "@propertyManagementModule/clients/panel/private/sales/center/actions/completeHandover.tsx";

type SaleRowMenuExtrasProps = {
    sale: Sale;
    onAction: (action: string) => void;
};

/** Custom `ActionMenu` children. Standard View / Edit / Delete / Restore come from `ActionMenu`. */
export default function SaleRowMenuExtras({sale, onAction}: SaleRowMenuExtrasProps) {
    const {write} = useAccess("sales");
    const writeFields = (typeof write === "object" && write !== null ? write : {}) as Record<string, unknown>;
    const canWriteHandover = writeFields.handoverDate !== undefined;
    const isDeleted = sale.deletedAt != null || sale.deletedBy != null;
    const hasHandover = !!sale.handoverDate;
    const handoverDone = !!sale.handoverCompletedAt;

    return (
        <>
            {canWriteHandover && !isDeleted && hasHandover && !handoverDone && (
                <CompleteHandover onAction={onAction} />
            )}
            <ManualSaleClientEmails sale={sale} />
        </>
    );
}

