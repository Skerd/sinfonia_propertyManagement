import type {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import type {HandoverPackage} from "armonia/src/modules/propertyManagement/api/realEstate/private/handoverPackage/handoverPackage.dto.ts";

export function canUpdateHandover(sale: Sale): boolean {
    return !!sale.handoverPackage && !sale.titleTransferDate;
}

export function canRecordTitleTransfer(sale: Sale): boolean {
    if (sale.titleTransferDate) return false;
    if (!sale.requiresHandoverPackageForHandover) return true;
    return sale.handoverPackage?.status === "completed";
}

export function canUpdateHandoverPackage(pkg: HandoverPackage): boolean {
    return !pkg.titleTransferred;
}
