import type {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";

export function canUpdateHandover(sale: Sale): boolean {
    if (sale.titleTransferDate) return false;
    const items = sale.handoverChecklistItems ?? [];
    const configs = sale.handoverConfigs ?? [];
    return configs.length > 0 || items.length > 0;
}

export function canRecordTitleTransfer(sale: Sale): boolean {
    if (sale.titleTransferDate) return false;
    if (!sale.requiresHandoverPackageForHandover) return true;
    return !!sale.handoverChecklistComplete;
}
