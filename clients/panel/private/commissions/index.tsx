import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Commission} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.dto.ts";
import CommissionCard from "@propertyManagementModule/clients/panel/private/commissions/center/cardView/commissionCard.tsx";
import CommissionRowMenuExtras from "@propertyManagementModule/clients/panel/private/commissions/center/actions/commissionRowMenuExtras.tsx";
import CommissionSheetView from "@propertyManagementModule/clients/panel/private/commissions/center/sheetView/commissionSheetView.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";

function AllCommissions({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: resolveLanguageKey("statusLabel") as string,
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                {value: "pending",            label: resolveLanguageKey("fields.!enums.status.pending")  as string},
                {value: "pending_approval",   label: resolveLanguageKey("fields.!enums.status.pending_approval") as string},
                {value: "paid",               label: resolveLanguageKey("fields.!enums.status.paid")     as string},
                {value: "voided",             label: resolveLanguageKey("fields.!enums.status.voided")   as string},
            ],
        },
        {
            field: "sourceType",
            label: resolveLanguageKey("fields.sourceType") as string,
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                {value: "sale",        label: resolveLanguageKey("fields.!enums.sourceType.sale")        as string},
                {value: "reservation", label: resolveLanguageKey("fields.!enums.sourceType.reservation") as string},
            ],
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<Commission>
            apiUrl="/api/realEstate/commission"
            collectionName="commissions"
            accessModel="commissions"
            tableConfigKey="commissions"
            buildEditPath={() => ""}
            quickFilters={quickFilters}
            resolveLanguageKey={resolveLanguageKey}
            cardViewClassName={GRID_TRANSACTIONAL}
            rowActionMenu={{
                hideDelete: true,
                hideRestore: true,
                allowMenuForCustomChildren: true,
                hideEdit: true,
            }}
            renderCard={(commission, _onDelete, _onRestore, listRef) => (
                <CommissionCard
                    commission={commission}
                    onModifySuccess={(updated?: Commission) =>
                        updated && listRef.current?.updateRow?.(updated._id, updated)
                    }
                />
            )}
            renderActionMenuChildren={(commission, _bind, helpers) => (
                <CommissionRowMenuExtras
                    commission={commission}
                    onModify={(updated?: Commission) => updated && helpers.replaceRow(updated)}
                />
            )}
            renderSheet={({entity, open, onOpenChange, listRef}) => (
                <CommissionSheetView
                    open={open}
                    onOpenChange={(o: boolean) => { if (!o) onOpenChange(); }}
                    commission={entity}
                    onModifySuccess={(updated?: Commission) => {
                        if (updated) listRef.current?.updateRow?.(updated._id, updated);
                    }}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/commissions/index.tsx"),
    withDebug(true, true),
)(AllCommissions);