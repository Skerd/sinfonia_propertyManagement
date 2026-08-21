import {compose} from "redux";
import type {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {Card} from "@coreModule/components/ui/card.tsx";
import {useEffect, useState} from "react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import UnitSheetView from "@propertyManagementModule/clients/panel/private/units/center/sheetView/unitSheetView.tsx";
import {UnitDomainMenuItems} from "@propertyManagementModule/clients/panel/private/units/center/actions/unitDomainMenuItems.tsx";
import {
    buildUnitEditPath,
    unitDeleteConfirmLabel,
} from "@propertyManagementModule/clients/panel/private/units/unitNavigation.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import {UnitStatusBadge} from "@propertyManagementModule/components/custom/cards/UnitStatusBadge.tsx";
import {EntityCardActionMenu} from "@propertyManagementModule/components/custom/cards/EntityCardActionMenu.tsx";

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export interface UnitDetailCardProps extends WithLanguageType {
    unit: Unit;
    projectId?: string;
    projectName?: string;
    edificeId?: string;
    edificeName?: string;
    onClose?: () => void;
    onUnitDeleted?: () => void;
    onUnitRestored?: () => void;
    menuOpened?: string;
    clicked: number;
}

function UnitDetailCardInner({
    resolveLanguageKey,
    unit,
    onUnitDeleted,
    onUnitRestored,
    menuOpened,
    clicked,
}: UnitDetailCardProps) {
    const {read} = useAccess("units");
    const [menuAction, setMenuAction] = useState<string>(menuOpened ?? "");

    const unitNumber = unit.unitNumber ?? unit.name ?? unit._id;
    const floorName = unit.floor?.name ?? "—";
    const typology = unit.unitType?.name ?? "—";
    const status = unit.status ?? "available_unit";

    const footprint = (Number(unit.area) || 0) + (Number(unit.sharedArea) || 0);
    const netArea = unit.netArea ?? (footprint > 0 ? footprint : undefined) ?? unit.area;
    const grossArea = unit.area ?? (footprint > 0 ? footprint : undefined) ?? unit.netArea;
    const unitArea = (Number(unit.area) || 0) + (Number(unit.verandaArea) || 0);
    const pricePerSqm = unit.statistics?.averagePricePerSquareMeter?.value ?? (unitArea > 0 && unit.price != null ? unit.price / unitArea : 0);
    const totalPrice = unit.price ?? 0;

    const isDeleted = !!unit.deletedAt || !!unit.deletedBy;

    useEffect(() => {
        setMenuAction(menuOpened ?? "");
    }, [unit, clicked]);

    const editPath = buildUnitEditPath(unit);
    const deleteLabel = unitDeleteConfirmLabel(read as Record<string, unknown> | undefined, unit);

    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    return (
        <>
            <Card
                className={cn(
                    "group border border-border bg-card/80 backdrop-blur-sm overflow-hidden relative animate-in fade-in-0 duration-200",
                    isDeleted && "border-l-4 border-l-destructive",
                )}
                data-cursor-element-id={`unit-detail-${unit._id}`}
            >
                <div
                    className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        isDeleted ? "bg-destructive/60" : "bg-primary/50",
                    )}
                />

                <div className="pl-4 pr-4 pt-4 pb-4 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-display font-semibold text-xl truncate">
                                    <HiddenElement randomLength={10}>
                                        {read?.name || read?.unitNumber ? unitNumber : null}
                                    </HiddenElement>
                                    {floorName !== "—" && (
                                        <span className="text-muted-foreground font-normal">
                                            {" · "}
                                            <HiddenElement randomLength={6}>
                                                {read?.floor ? floorName : null}
                                            </HiddenElement>
                                        </span>
                                    )}
                                </h3>
                                <HiddenElement randomLength={6}>
                                    {read?.status ? (
                                        <UnitStatusBadge status={status} resolveLanguageKey={resolveLanguageKey} />
                                    ) : null}
                                </HiddenElement>
                            </div>
                            {typology !== "—" && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    <HiddenElement randomLength={8}>
                                        {read?.unitType ? typology : null}
                                    </HiddenElement>
                                </p>
                            )}
                        </div>
                        <EntityCardActionMenu variant="inline">
                            <ActionMenu
                                accessModel={"units"}
                                deletedData={unit}
                                onAction={(a: string) => setMenuAction(a)}
                                editPath={editPath}
                                hideView={false}
                                allowMenuForCustomChildren={true}
                            >
                                <UnitDomainMenuItems unitId={unit._id} unitName={unit.name || unit.unitNumber || unit._id} />
                            </ActionMenu>
                        </EntityCardActionMenu>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <p className="text-xs text-muted-foreground">{resolveLanguageKey("netArea")}</p>
                            <p className="font-mono font-medium">
                                <HiddenElement randomLength={6}>
                                    {read?.netArea || read?.area
                                        ? (netArea != null ? `${netArea} m²` : "—")
                                        : null}
                                </HiddenElement>
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{resolveLanguageKey("grossArea")}</p>
                            <p className="font-mono font-medium">
                                <HiddenElement randomLength={6}>
                                    {read?.area
                                        ? (grossArea != null ? `${grossArea} m²` : "—")
                                        : null}
                                </HiddenElement>
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{resolveLanguageKey("pricePerSqm")}</p>
                            <p className="font-mono font-semibold text-primary">
                                <HiddenElement randomLength={8}>
                                    {read?.price
                                        ? (pricePerSqm > 0 ? formatCurrency(pricePerSqm) : "—")
                                        : null}
                                </HiddenElement>
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{resolveLanguageKey("totalPrice")}</p>
                            <p className="font-mono font-semibold text-primary">
                                <HiddenElement randomLength={8}>
                                    {read?.price
                                        ? (totalPrice > 0 ? formatCurrency(totalPrice) : "—")
                                        : null}
                                </HiddenElement>
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {!!menuAction && (
                <>
                    {menuAction === "view" && (
                        <UnitSheetView
                            open={menuAction === "view"}
                            onOpenChange={() => setMenuAction("")}
                            unit={unit}
                            onDelete={() => onUnitDeleted?.()}
                            onRestore={() => onUnitRestored?.()}
                        />
                    )}
                    {menuAction === "delete" && (
                        <DeleteAction
                            accessModel={"units"}
                            deleteId={unit._id}
                            openAlert={menuAction === "delete"}
                            name={deleteLabel}
                            confirmName={deleteLabel}
                            onSuccess={(_data: DeletedData) => {
                                onUnitDeleted?.();
                            }}
                            onCancel={() => setMenuAction("")}
                            url={`/api/realEstate/unit`}
                        />
                    )}
                    {menuAction === "restore" && (
                        <RestoreAction
                            accessModel={"units"}
                            deleteId={unit._id}
                            openAlert={menuAction === "restore"}
                            name={deleteLabel}
                            confirmName={deleteLabel}
                            onSuccess={(_data: DeletedData) => {
                                onUnitRestored?.();
                            }}
                            onCancel={() => setMenuAction("")}
                            url={`/api/realEstate/unit/restore`}
                        />
                    )}
                </>
            )}
        </>
    );
}

export const UnitDetailCard = compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/dashboard/UnitDetailCard.tsx"),
)(UnitDetailCardInner);
