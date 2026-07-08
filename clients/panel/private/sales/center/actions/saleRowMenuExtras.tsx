import {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import ManualSaleClientEmails from "@propertyManagementModule/clients/panel/private/sales/center/actions/manualSaleClientEmails.tsx";

type SaleRowMenuExtrasProps = {
    sale: Sale;
};

/** Custom `ActionMenu` children for client sale emails. Standard View / Edit / Delete / Restore come from `ActionMenu`. */
export default function SaleRowMenuExtras({sale}: SaleRowMenuExtrasProps) {
    return <ManualSaleClientEmails sale={sale} />;
}
