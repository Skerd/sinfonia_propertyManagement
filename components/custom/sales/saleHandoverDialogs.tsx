import type {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import type {HandoverPackage} from "armonia/src/modules/propertyManagement/api/realEstate/private/handoverPackage/handoverPackage.dto.ts";
import UpdateHandoverDialog from "@propertyManagementModule/components/custom/sales/updateHandoverDialog.tsx";
import RecordTitleTransferDialog from "@propertyManagementModule/components/custom/sales/recordTitleTransferDialog.tsx";

type SaleHandoverDialogsProps = {
    action: string;
    sale: Sale;
    onClose: () => void;
    onSaleSuccess?: (updated?: Sale) => void;
    onPackageSuccess?: (updated?: HandoverPackage) => void;
};

export default function SaleHandoverDialogs({
    action,
    sale,
    onClose,
    onSaleSuccess,
    onPackageSuccess,
}: SaleHandoverDialogsProps) {
    if (action === "updateHandover" && sale.handoverPackage) {
        return (
            <UpdateHandoverDialog
                open
                onClose={onClose}
                handoverPackage={sale.handoverPackage}
                onSuccess={(updated) => {
                    if (updated) onPackageSuccess?.(updated);
                    onSaleSuccess?.({...sale, handoverPackage: updated ?? sale.handoverPackage});
                }}
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
