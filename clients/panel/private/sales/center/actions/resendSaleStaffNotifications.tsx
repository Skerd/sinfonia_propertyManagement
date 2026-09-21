import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import ResendStaffNotificationsMenuItem from "@propertyManagementModule/components/custom/sale/resendStaffNotificationsMenuItem.tsx";

type ResendSaleStaffNotificationsProps = WithLanguageType &
    WithAxiosType<{ok: true; recipients: number}, {_id: string}> & {
        sale: Sale;
    };

/** Re-sends the "new sale" alert to the Sales & handover → Notify on sales list. */
function ResendSaleStaffNotifications({sale, resolveLanguageKey, innerRef, onFilterChange, loading}: ResendSaleStaffNotificationsProps) {
    if (sale.deletedAt != null || sale.deletedBy != null) {
        return null;
    }
    return (
        <ResendStaffNotificationsMenuItem
            resolveLanguageKey={resolveLanguageKey}
            loading={loading}
            innerRef={innerRef}
            onConfirm={() => onFilterChange({_id: sale._id})}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/actions/resendSaleStaffNotifications.tsx"),
    withAxios(
        {
            method: "POST",
            url: "/api/realEstate/unit/sale/resendStaffNotifications",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "sales"),
)(ResendSaleStaffNotifications);
