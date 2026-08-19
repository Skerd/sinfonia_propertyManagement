import {compose} from "redux";
import {useEffect, useState, type ReactNode} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {RentalPayment} from "armonia/src/modules/propertyManagement/api/realEstate/private/rentalPayment/rentalPayment.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

export type RentalPaymentSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rentalPayment?: RentalPayment;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
    actionMenuChildren?: ReactNode;
    actionMenuAllowCustomChildren?: boolean;
    onActionMenuAction?: (action: string) => void;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
};

function buildRentalPaymentEditPath(payment: RentalPayment) {
    const params = new URLSearchParams();
    params.set("rentalPaymentId", payment._id);
    if (payment.name) params.set("rentalPaymentName", payment.name);
    return `/realEstate/rentalPayments/edit?${params.toString()}`;
}

function RentalPaymentSheetView({
    open,
    onOpenChange,
    rentalPayment: paymentProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
    actionMenuChildren,
    actionMenuAllowCustomChildren,
    onActionMenuAction,
    onSheetRowPatched,
}: RentalPaymentSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(paymentProp || {_id: fetchId});
    const access = useAccess("rentalpayments");
    const viewConfig = useViewConfig("rentalpayments", "sheet");

    useEffect(() => {
        if (!paymentProp) return;
        setSheetData(paymentProp);
    }, [paymentProp]);

    const entityId = paymentProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/rentalPayment/single"
            fetchId={fetchId}
            onDataFetched={(data) => setSheetData(data)}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={buildRentalPaymentEditPath(sheetData as RentalPayment)}
            actionMenuChildren={actionMenuChildren}
            actionMenuAllowCustomChildren={actionMenuAllowCustomChildren}
            onActionMenuAction={onActionMenuAction}
            onSheetRowPatched={onSheetRowPatched}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/rentalPayments/center/sheetView/rentalPaymentSheetView.tsx"),
    withDebug(true, true, "rentalpayments"),
)(RentalPaymentSheetView);
