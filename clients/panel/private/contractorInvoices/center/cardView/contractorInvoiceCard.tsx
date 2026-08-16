import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {ContractorInvoice} from "armonia/src/modules/propertyManagement/api/realEstate/private/contractorInvoice/contractorInvoice.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/contractorInvoices/center/sheetView/contractorInvoiceSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function contractorInvoiceEditPath(entity: ContractorInvoice) {
    const params = new URLSearchParams();
    params.set("contractorInvoiceId", entity._id);
    if (entity.name) params.set("contractorInvoiceName", entity.name);
    return `/realEstate/contractorInvoices/edit?${params.toString()}`;
}

type ContractorInvoiceCardProps = WithLanguageType & {
    entity: ContractorInvoice;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: ContractorInvoice, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ContractorInvoice> | null>;
};

function ContractorInvoiceCard({
    resolveLanguageKey,
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: ContractorInvoiceCardProps) {
    return (
        <EntityCard
            resource="contractorinvoices"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/contractorInvoice/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={contractorInvoiceEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/contractorInvoice"
            restoreUrl="/api/realEstate/contractorInvoice/restore"
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => (
                <EntityCard.Header
                    titlePath="name"
                    title={row.name}
                    subtitle={row.invoiceNumber}
                    subtitlePath="invoiceNumber"
                    badges={row.status ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{String(resolveLanguageKey(`status.${row.status}`, true) || resolveLanguageKey(`statuses.${row.status}`, true) || row.status)}</Badge>
                    ) : null}
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/contractorInvoices/center/cardView/contractorInvoiceCard.tsx"),
    withDebug(true, true),
)(ContractorInvoiceCard);
