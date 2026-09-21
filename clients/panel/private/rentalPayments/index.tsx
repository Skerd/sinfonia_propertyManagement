import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconReceiptDollar} from "@tabler/icons-react";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import MarkRentalPaymentPaid, {MARK_RENTAL_PAYMENT_PAID_ACTION} from "@propertyManagementModule/clients/panel/private/rentalPayments/center/actions/markPaid.tsx";
import WaiveRentalPayment, {WAIVE_RENTAL_PAYMENT_ACTION} from "@propertyManagementModule/clients/panel/private/rentalPayments/center/actions/waive.tsx";
import ManualRentClientEmails from "@propertyManagementModule/clients/panel/private/leases/center/actions/manualRentClientEmails.tsx";
import MarkRentalPaymentPaidDialog from "@propertyManagementModule/components/custom/rentalPayments/markRentalPaymentPaidDialog.tsx";
import WaiveRentalPaymentDialog from "@propertyManagementModule/components/custom/rentalPayments/waiveRentalPaymentDialog.tsx";
import RentalPaymentCard from "@propertyManagementModule/clients/panel/private/rentalPayments/center/cardView/rentalPaymentCard.tsx";
import {
    GRID_COLS_MAX_4,
    GRID_TRANSACTIONAL
} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {buildPageTitle} from "@coreModule/helpers/general/pageTitle.ts";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import {cn} from "@coreModule/components/lib/utils.ts";

interface AllRentalPaymentsProps extends WithLanguageType {
    leaseId?: string;
    leaseName?: string;
}

function buildRentalPaymentEditPath(payment: RentalPayment) {
    const params = new URLSearchParams();
    params.set("rentalPaymentId", payment._id);
    if (payment.name) params.set("rentalPaymentName", payment.name);
    if (payment.lease?._id) params.set("leaseId", payment.lease._id);
    return `/realEstate/rentalPayments/edit?${params.toString()}`;
}

function AllRentalPayments({resolveLanguageKey, leaseId, leaseName}: AllRentalPaymentsProps) {
    const extraFilters = useMemo(() => (leaseId ? {lease: leaseId} : undefined), [leaseId]);
    const headerTitle = buildPageTitle(
        String(resolveLanguageKey("title")),
        leaseName ? [leaseName] : [],
    );

    const quickFilters = useMemo<QuickFilterDef[]>(() => {
        const statusFilter: QuickFilterDef = {
            field: "status",
            label: resolveLanguageKey("fields.status"),
            type: COLUMN_TYPE.ENUM,
            asExtraParam: true,
            enumValues: [
                {value: "pending", label: resolveLanguageKey("fields.!enums.status.pending")},
                {value: "paid", label: resolveLanguageKey("fields.!enums.status.paid")},
                {value: "partially_paid", label: resolveLanguageKey("fields.!enums.status.partially_paid")},
                {value: "overdue", label: resolveLanguageKey("fields.!enums.status.overdue")},
                {value: "waived", label: resolveLanguageKey("fields.!enums.status.waived")},
            ],
        };
        const moneyAndDateFilters: QuickFilterDef[] = [
            {
                field: "currency",
                label: resolveLanguageKey("fields.currency"),
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/finance/currency/select",
            },
            {
                field: "dueDate",
                label: resolveLanguageKey("fields.dueDate"),
                type: COLUMN_TYPE.DATE,
            },
            {
                field: "paidDate",
                label: resolveLanguageKey("fields.paidDate"),
                type: COLUMN_TYPE.DATE,
            },
            statusFilter,
        ];
        if (leaseId) return moneyAndDateFilters;
        return [
            {
                field: "project",
                label: resolveLanguageKey("fields.project"),
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/project/select",
                asExtraParam: true,
            },
            {
                field: "edifice",
                label: resolveLanguageKey("fields.edifice"),
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/edifice/select",
                dependsOn: "project",
                asExtraParam: true,
            },
            {
                field: "floor",
                label: resolveLanguageKey("fields.floor"),
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/floor/select",
                dependsOn: ["edifice", "project"],
                asExtraParam: true,
            },
            {
                field: "unit",
                label: resolveLanguageKey("fields.unit"),
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/unit/select",
                dependsOn: ["floor", "edifice", "project"],
            },
            {
                field: "lease",
                label: resolveLanguageKey("fields.lease"),
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/lease/select",
                asExtraParam: true,
            },
            ...moneyAndDateFilters,
        ];
    }, [resolveLanguageKey, leaseId]);

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
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/rentalPayments/center/sheetView/rentalPaymentSheetView.tsx"
            cardViewClassName={cn(GRID_TRANSACTIONAL, GRID_COLS_MAX_4)}
            extraFilters={extraFilters}
            quickFilters={quickFilters}
            headerTitle={headerTitle}
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderCard={(payment, onDelete, onRestore, listRef) => (
                <RentalPaymentCard
                    payment={payment}
                    onDelete={(row: RentalPayment | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(payment)}
                    onActionSuccess={(updated?: RentalPayment) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                />
            )}
            renderActionMenuChildren={(payment, bindRowAction) => (
                <>
                    <MarkRentalPaymentPaid payment={payment} onAction={bindRowAction} />
                    <WaiveRentalPayment payment={payment} onAction={bindRowAction} />
                    <ManualRentClientEmails payment={payment} />
                </>
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
                if (action === WAIVE_RENTAL_PAYMENT_ACTION)
                    return (
                        <WaiveRentalPaymentDialog
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
    withDebug(true, true, "rentalpayments"),
)(AllRentalPayments);
