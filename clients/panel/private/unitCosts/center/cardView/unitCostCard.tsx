import { compose } from "redux";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, { WithAxiosType } from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import { useEffect, useImperativeHandle, useState } from "react";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import { useAccess } from "@coreModule/helpers/hocs/withAccess.tsx";
import { format } from "date-fns";
import { cn } from "@coreModule/components/lib/utils.ts";
import { Badge } from "@coreModule/components/ui/badge.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import type { UnitCost } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.dto.ts";
import type { SingleForm } from "armonia/src/modules/core/types/shared.types.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {
    IconBuilding,
    IconCalendar,
    IconCashBanknote,
    IconReceipt,
    IconTag,
    IconTool,
    IconUser,
} from "@tabler/icons-react";
import UnitCostSheetView from "@propertyManagementModule/clients/panel/private/unitCosts/center/sheetView/unitCostSheetView.tsx";
import { buildUnitCostEditPath } from "@propertyManagementModule/clients/panel/private/unitCosts/unitCostEditPath.ts";
import UnitCostInvoicePdfActionMenuItem from "@propertyManagementModule/components/custom/unitCosts/unitCostInvoicePdfActionMenuItem.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityCardFetchGuard} from "@propertyManagementModule/components/custom/cards/EntityCardFetchGuard.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";

type UnitCostCardProps = WithLanguageType &
    WithAxiosType<UnitCost, SingleForm> & {
        unitCost: UnitCost;
        unitId: string;
        unitName: string;
        fetchId?: string;
        hideActions?: boolean;
        onDelete?: (unitCost: UnitCost, response: DeletedData) => void;
        onRestore?: () => void;
        small?: boolean;
    };

function UnitCostCard({
    unitCost: paramUnitCost,
    resolveLanguageKey,
    unitId,
    unitName,
    fetchId,
    onFilterChange,
    loading,
    error,
    innerRef,
    onDelete: onDeleteProp = () => {},
    onRestore: onRestoreProp = () => {},
    hideActions = false,
    small,
}: UnitCostCardProps) {
    const {action, setAction, entity: unitCost, setEntity: setUnitCost, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: paramUnitCost,
        onDeleteProp,
        onRestoreProp,
        syncPropOnChange: !fetchId,
    });
    const [forceReload, setForceReload] = useState(1);
    const { read, restore } = useAccess("unitCosts");

    useEffect(() => {
        if (fetchId) {
            onFilterChange({ _id: fetchId });
        }
    }, [fetchId, forceReload]);

    useImperativeHandle(innerRef, () => ({
        success: (data: UnitCost) => {
            setUnitCost(data);
        },
    }));

    const fmtMoney = (n?: number) =>
        n != null && Number.isFinite(n)
            ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : "—";

    const currencySym =
        unitCost.currency?.symbol ?? unitCost.currency?.abbreviation ?? "";

    const deleteRestoreName = read?.name ? unitCost?.name : undefined;

    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }
    if (hideAfterDeletion || !restore) {
        return <></>;
    }
    if (!unitCost?._id) {
        return <></>;
    }

    const resolvedUnitId = unitId || unitCost.unit?._id || "";
    const resolvedUnitName =
        unitName || unitCost.unit?.name || (unitCost.unit?.unitNumber != null ? String(unitCost.unit.unitNumber) : "");

    const verificationLabel = String(
        resolveLanguageKey(`unitCostVerification.${unitCost.verificationStatus || "pending_verification"}`),
    );
    const paymentLabel = String(resolveLanguageKey(`unitCostPayment.${unitCost.paymentStatus || "unpaid"}`));

    return (
        <EntityCardFetchGuard
            fetchId={fetchId}
            loading={loading}
            error={error}
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            onRetry={() => setForceReload((n) => n + 1)}
        >
            <>
                <EntityCardShell
                    className={cn(small && "text-sm")}
                    onClick={fetchId ? undefined : () => setAction("view")}
                    disableClick={!!fetchId}
                >
                    <div className="flex w-full items-stretch">
                        {(read?.deletedBy || read?.deletedAt) && (
                            <DeletedInfo deletedAt={unitCost.deletedAt} deletedBy={unitCost.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                iconTile={
                                    <div className="flex items-center justify-center rounded-lg bg-muted/50 p-2">
                                        <IconReceipt className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                }
                                title={
                                    <span className="flex items-center gap-1 truncate">
                                        {unitCost.name}
                                        {!!unitCost.invoiceNumber && (
                                            <span className="shrink-0 text-xs font-normal text-muted-foreground">#{unitCost.invoiceNumber}</span>
                                        )}
                                        <CopyTooltip text={unitCost.name} />
                                    </span>
                                }
                                showTitle={!!read?.name}
                                badges={
                                    <>
                                        <TooltipDisplayer tooltip={verificationLabel}>
                                            <Badge variant="outline" className="text-xs font-normal">
                                                {verificationLabel}
                                            </Badge>
                                        </TooltipDisplayer>
                                        <TooltipDisplayer tooltip={paymentLabel}>
                                            <Badge variant="secondary" className="text-xs font-normal">
                                                {paymentLabel}
                                            </Badge>
                                        </TooltipDisplayer>
                                        {!!unitCost.tag && (
                                            <TooltipDisplayer tooltip={unitCost.tag}>
                                                <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                                    <IconTag className="h-3 w-3 mr-1" />
                                                    {unitCost.tag}
                                                </Badge>
                                            </TooltipDisplayer>
                                        )}
                                    </>
                                }
                                showBadges={!!(read?.verificationStatus || read?.paymentStatus || read?.tag)}
                                hideActions={hideActions}
                                actionMenu={
                                    <ActionMenu
                                        accessModel="unitCosts"
                                        deletedData={unitCost}
                                        onAction={(a: string) => setAction(a)}
                                        editPath={buildUnitCostEditPath(unitCost, resolvedUnitId, resolvedUnitName)}
                                        allowMenuForCustomChildren
                                    >
                                        <UnitCostInvoicePdfActionMenuItem entity={unitCost as Record<string, unknown>} />
                                    </ActionMenu>
                                }
                            />
                            {!small && (
                                <div className={CARD_BODY_CLASS}>
                                    <InfoRow
                                        icon={IconCalendar}
                                        label={resolveLanguageKey("purchaseDate")}
                                        tooltip={resolveLanguageKey("purchaseDate")}
                                        show={!!read?.purchaseDate}
                                        value={unitCost.purchaseDate ? format(new Date(unitCost.purchaseDate), "PP") : null}
                                    />
                                    <InfoRow
                                        icon={IconUser}
                                        label={resolveLanguageKey("purchasePerson")}
                                        tooltip={resolveLanguageKey("purchasePerson")}
                                        show={!!read?.purchasePerson}
                                        value={
                                            unitCost.purchasePerson
                                                ? [unitCost.purchasePerson.name, unitCost.purchasePerson.surname].filter(Boolean).join(" ")
                                                : null
                                        }
                                    />
                                    {!!unitCost.vendorName && (
                                        <InfoRow
                                            icon={IconBuilding}
                                            label={resolveLanguageKey("vendorName")}
                                            tooltip={resolveLanguageKey("vendorName")}
                                            show={true}
                                            value={unitCost.vendorName}
                                        />
                                    )}
                                    {!!unitCost.relatedModificationRequest?.name && (
                                        <InfoRow
                                            icon={IconTool}
                                            label={resolveLanguageKey("relatedModificationRequest")}
                                            tooltip={resolveLanguageKey("relatedModificationRequest")}
                                            show={true}
                                            value={unitCost.relatedModificationRequest.name}
                                        />
                                    )}
                                    <InfoRow
                                        icon={IconCashBanknote}
                                        label={resolveLanguageKey("documentSubtotal")}
                                        tooltip={resolveLanguageKey("documentSubtotal")}
                                        show={unitCost.documentSubtotal != null}
                                        value={
                                            unitCost.documentSubtotal != null
                                                ? `${currencySym ? `${currencySym} ` : ""}${fmtMoney(unitCost.documentSubtotal)}`
                                                : null
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </EntityCardShell>

                {action === "view" && (
                    <UnitCostSheetView
                        open
                        onOpenChange={(open: boolean) => {
                            if (!open) setAction("");
                        }}
                        unitCost={unitCost}
                        unitId={resolvedUnitId}
                        unitName={resolvedUnitName}
                        hideActions={hideActions}
                        onDelete={(data?: DeletedData) => {
                            if (data?.deletedAt != null || data?.deletedBy != null) {
                                setUnitCost((prev) => ({ ...prev, ...data }));
                            }
                            onDeleteProp(unitCost, data as DeletedData);
                        }}
                        onRestore={() => {
                            setUnitCost((prev) => ({ ...prev, deletedAt: undefined, deletedBy: undefined }));
                            onRestoreProp();
                        }}
                    />
                )}

                {!!action && action !== "view" && (
                    <>
                        {action === "delete" && (
                            <DeleteAction
                                accessModel="unitCosts"
                                deleteId={unitCost._id}
                                openAlert={action === "delete"}
                                name={deleteRestoreName}
                                confirmName={deleteRestoreName}
                                onSuccess={(data: DeletedData) => {
                                    onDelete(data);
                                    setAction("");
                                }}
                                onCancel={() => setAction("")}
                                url="/api/realEstate/unit/cost"
                            />
                        )}
                        {action === "restore" && (
                            <RestoreAction
                                accessModel="unitCosts"
                                deleteId={unitCost._id}
                                openAlert={action === "restore"}
                                name={deleteRestoreName}
                                confirmName={deleteRestoreName}
                                onSuccess={() => {
                                    onRestore();
                                    setAction("");
                                }}
                                onCancel={() => setAction("")}
                                url="/api/realEstate/unit/cost/restore"
                            />
                        )}
                    </>
                )}
            </>
        </EntityCardFetchGuard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/unitCosts/center/cardView/unitCostCard.tsx"),
    withAxios(
        {
            url: "/api/realEstate/unit/cost/single",
            method: "POST",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(UnitCostCard);
