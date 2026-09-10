import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editSaleFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/editSale.form.validator.ts";
import type {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import type {EditSaleFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/editSale.form.type.ts";

export default createGenericEditPage<Sale, EditSaleFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/sales/editSale.tsx",
    model: "sales",
    apiUrl: "/api/realEstate/unit/sale",
    schema: editSaleFormSchema,
    mapEntityData: (data) => ({
        ...data,
        notes: data.notes ?? "",
        transactionReference: data.transactionReference ?? "",
    }),
    buildExtraTitles: (params) => [params.get("unitName")].filter((x): x is string => !!x),
});
