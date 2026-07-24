import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL_WIDE} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {IncomingInvoice} from "armonia/src/modules/propertyManagement/api/realEstate/private/incomingInvoice/incomingInvoice.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import IncomingInvoiceCard from "@propertyManagementModule/clients/panel/private/incomingInvoices/center/cardView/incomingInvoiceCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: IncomingInvoice) {
    const params = new URLSearchParams();
    params.set("incomingInvoiceId", row._id);
    if (row.name) params.set("incomingInvoiceName", row.name);
    return `/realEstate/incomingInvoices/edit?${params.toString()}`;
}

function AllIncomingInvoices({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<IncomingInvoice>
            apiUrl="/api/realEstate/incomingInvoice"
            collectionName="incominginvoices"
            accessModel="incominginvoices"
            tableConfigKey="incominginvoices"
            createPath="/realEstate/incomingInvoices/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createIncomingInvoice"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/incomingInvoices/center/sheetView/incomingInvoiceSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL_WIDE}
            renderCard={(row, onDelete, onRestore) => (
                <IncomingInvoiceCard
                    entity={row}
                    onDelete={(r: IncomingInvoice | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/incomingInvoices/index.tsx"),
    withDebug(true, true),
)(AllIncomingInvoices);
