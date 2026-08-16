import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {IncomingInvoice} from "armonia/src/modules/propertyManagement/api/realEstate/private/incomingInvoice/incomingInvoice.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import Sheet from "@propertyManagementModule/clients/panel/private/incomingInvoices/center/sheetView/incomingInvoiceSheetView.tsx";
import {STATUS_BADGE_NEUTRAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function incomingInvoiceEditPath(entity: IncomingInvoice) {
    const params = new URLSearchParams();
    params.set("incomingInvoiceId", entity._id);
    if (entity.name) params.set("incomingInvoiceName", entity.name);
    return `/realEstate/incomingInvoices/edit?${params.toString()}`;
}

type IncomingInvoiceCardProps = WithLanguageType & {
    entity: IncomingInvoice;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: IncomingInvoice, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<IncomingInvoice> | null>;
};

function IncomingInvoiceCard({
    entity,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: IncomingInvoiceCardProps) {
    return (
        <EntityCard
            resource="incominginvoices"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/realEstate/incomingInvoice/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={incomingInvoiceEditPath}
            Sheet={Sheet}
            sheetEntityProp="entity"
            deleteUrl="/api/realEstate/incomingInvoice"
            restoreUrl="/api/realEstate/incomingInvoice/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => (
                <EntityCard.Header
                    titlePath="name"
                    title={row.name}
                    subtitle={row.extractedSupplierName}
                    subtitlePath="extractedSupplierName"
                    badges={row.status ? (
                        <Badge variant="secondary" className={cn("text-xs", STATUS_BADGE_NEUTRAL)}>{row.status}</Badge>
                    ) : null}
                />
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/incomingInvoices/center/cardView/incomingInvoiceCard.tsx"),
    withDebug(true, true),
)(IncomingInvoiceCard);
