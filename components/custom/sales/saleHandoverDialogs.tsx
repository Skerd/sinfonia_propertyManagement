import type {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import UpdateHandoverDialog from "@propertyManagementModule/components/custom/sales/updateHandoverDialog.tsx";
import RecordTitleTransferDialog from "@propertyManagementModule/components/custom/sales/recordTitleTransferDialog.tsx";

type SaleHandoverDialogsProps = {
    action: string;
    sale: Sale;
    onClose: () => void;
    onSaleSuccess?: (updated?: Sale) => void;
};

export default function SaleHandoverDialogs({
    action,
    sale,
    onClose,
    onSaleSuccess,
}: SaleHandoverDialogsProps) {
    if (action === "updateHandover") {
        return (
            <UpdateHandoverDialog
                open
                onClose={onClose}
                sale={sale}
                onSuccess={onSaleSuccess}
            />
        );
    }
    if (action === "recordTitleTransfer") {
        return (
            <RecordTitleTransferDialog
                open
                onClose={onClose}
                sale={sale}
                onSuccess={onSaleSuccess}
            />
        );
    }
    return null;
}
