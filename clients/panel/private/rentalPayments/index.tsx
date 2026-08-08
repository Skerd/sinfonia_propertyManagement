import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconReceiptDollar} from "@tabler/icons-react";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import MarkRentalPaymentPaid, {MARK_RENTAL_PAYMENT_PAID_ACTION} from "@propertyManagementModule/clients/panel/private/rentalPayments/center/actions/markPaid.tsx";
import MarkRentalPaymentPaidDialog from "@propertyManagementModule/components/custom/rentalPayments/markRentalPaymentPaidDialog.tsx";
import RentalPaymentCard from "@propertyManagementModule/clients/panel/private/rentalPayments/center/cardView/rentalPaymentCard.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {buildPageTitle} from "@coreModule/helpers/general";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";

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
    const extraFilters = useMemo(() => (leaseId ? {lease: leaseId} : undefined), [leaseId]);
    const headerTitle = buildPageTitle(
        String(resolveLanguageKey("title")),
        leaseName ? [leaseName] : [],
    );

    const quickFilters = useMemo<QuickFilterDef[]>(() => {
        if (leaseId) return [];
        return [
            {
                field: "project",
                label: resolveLanguageKey("fields.project") as string,
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/project/select",
                asExtraParam: true,
            },
            {
                field: "edifice",
                label: resolveLanguageKey("fields.edifice") as string,
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/edifice/select",
                dependsOn: "project",
                asExtraParam: true,
            },
            {
                field: "floor",
                label: resolveLanguageKey("fields.floor") as string,
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/floor/select",
                dependsOn: ["edifice", "project"],
                asExtraParam: true,
            },
            {
                field: "unit",
                label: resolveLanguageKey("fields.unit") as string,
                type: COLUMN_TYPE.OBJECT_ID,
                apiUrl: "/api/realEstate/unit/select",
                dependsOn: ["floor", "edifice", "project"],
            },
            {
                field: "status",
                label: resolveLanguageKey("fields.status") as string,
                type: COLUMN_TYPE.ENUM,
                enumValues: [
                    {value: "pending", label: resolveLanguageKey("fields.!enums.status.pending") as string},
                    {value: "paid", label: resolveLanguageKey("fields.!enums.status.paid") as string},
                    {value: "overdue", label: resolveLanguageKey("fields.!enums.status.overdue") as string},
                    {value: "waived", label: resolveLanguageKey("fields.!enums.status.waived") as string},
                ],
            },
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
            cardViewClassName={GRID_TRANSACTIONAL}
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
