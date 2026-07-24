import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL_WIDE} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {ContractorInvoice} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractorInvoice/contractorInvoice.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ContractorInvoiceCard from "@propertyManagementModule/clients/panel/private/contractorInvoices/center/cardView/contractorInvoiceCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: ContractorInvoice) {
    const params = new URLSearchParams();
    params.set("contractorInvoiceId", row._id);
    if (row.name) params.set("contractorInvoiceName", row.name);
    return `/realEstate/contractorInvoices/edit?${params.toString()}`;
}

function AllContractorInvoices({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<ContractorInvoice>
            apiUrl="/api/realEstate/contractorInvoice"
            collectionName="contractorinvoices"
            accessModel="contractorinvoices"
            tableConfigKey="contractorinvoices"
            createPath="/realEstate/contractorInvoices/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createContractorInvoice"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/contractorInvoices/center/sheetView/contractorInvoiceSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL_WIDE}
            renderCard={(row, onDelete, onRestore) => (
                <ContractorInvoiceCard
                    entity={row}
                    onDelete={(r: ContractorInvoice | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/contractorInvoices/index.tsx"),
    withDebug(true, true),
)(AllContractorInvoices);
