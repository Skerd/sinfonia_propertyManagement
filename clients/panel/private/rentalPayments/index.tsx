import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconReceiptDollar} from "@tabler/icons-react";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";
import MarkRentalPaymentPaid, {MARK_RENTAL_PAYMENT_PAID_ACTION} from "@propertyManagementModule/clients/panel/private/rentalPayments/center/actions/markPaid.tsx";
import MarkRentalPaymentPaidDialog from "@propertyManagementModule/components/custom/rentalPayments/markRentalPaymentPaidDialog.tsx";

interface AllRentalPaymentsProps extends WithLanguageType {
    leaseId?: string;
    leaseName?: string;
}

function buildRentalPaymentEditPath(payment: RentalPayment) {
    const params = new URLSearchParams();
    params.set("rentalPaymentId", payment._id);
    if (payment.name) params.set("rentalPaymentName", payment.name);
    if ((payment.lease as any)?._id) {
        params.set("leaseId", (payment.lease as any)._id);
    }
    return `/realEstate/rentalPayments/edit?${params.toString()}`;
}

function AllRentalPayments({resolveLanguageKey, leaseId, leaseName}: AllRentalPaymentsProps) {
    const extraFilters = leaseId ? {leaseId} : undefined;
    const extraTitles  = leaseName ? [leaseName] : undefined;

    return (
        <EntityListPage<RentalPayment>
            apiUrl="/api/realEstate/rentalPayment"
            collectionName="rentalpayments"
            accessModel="rentalpayments"
            tableConfigKey="rentalpayments"
            createPath={leaseId
                ? `/realEstate/rentalPayments/create?leaseId=${leaseId}${leaseName ? `&leaseName=${encodeURIComponent(leaseName)}` : ""}`
                : "/realEstate/rentalPayments/create"
            }
            createIcon={<IconReceiptDollar className="h-4 w-4" />}
            createLanguageKey="createRentalPayment"
            buildEditPath={buildRentalPaymentEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/rentalPayments/index.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            extraFilters={extraFilters}
            extraTitles={extraTitles}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderActionMenuChildren={(payment, bindRowAction) => (
                <MarkRentalPaymentPaid payment={payment} onAction={bindRowAction} />
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                const onSuccess = (updated?: RentalPayment) => {
                    if (updated?._id) listRef.current?.updateRow?.(updated._id, updated);
                    resetAction();
                };
                if (action === MARK_RENTAL_PAYMENT_PAID_ACTION)
                    return (
                        <MarkRentalPaymentPaidDialog
                            open
                            onClose={resetAction}
                            payment={entity}
                            onSuccess={onSuccess}
                        />
                    );
                return null;
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/rentalPayments/index.tsx"),
    withDebug(true, true),
)(AllRentalPayments);
