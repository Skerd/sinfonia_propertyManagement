import { compose } from "redux";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import Header from "@coreModule/components/custom/header.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import { useMemo, useRef, useState, useEffect } from "react";
import { Button } from "@coreModule/components/ui/button.tsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAccess } from "@coreModule/helpers/hocs/withAccess.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import { buildTitleBreadcrumb } from "@coreModule/helpers/general";
import CardAndTableView from "@coreModule/components/custom/cardAndTableView.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import UnitCostCard from "@propertyManagementModule/clients/panel/private/unitCosts/center/cardView/unitCostCard.tsx";
import UnitCostSheetView from "@propertyManagementModule/clients/panel/private/unitCosts/center/sheetView/unitCostSheetView.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import { buildUnitCostEditPath } from "@propertyManagementModule/clients/panel/private/unitCosts/unitCostEditPath.ts";
import PaymentCalendarTab from "@propertyManagementModule/clients/panel/private/unitCosts/paymentCalendarTab.tsx";
import FinanceUnitCostFilterBar, {
    emptyFinanceToolbarValues,
} from "@propertyManagementModule/clients/panel/private/unitCosts/financeUnitCostFilterBar.tsx";
import { buildFinanceToolbarOnlyFilterGroup } from "@propertyManagementModule/helpers/components/unitCosts/financeFilterDsl.ts";
import type { UnitCost } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.dto.ts";
import type { DeletedData, TableForm, TableResponse } from "armonia/src/modules/core/types/shared.types.ts";
import { IconTextPlus } from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@coreModule/components/ui/tabs.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@coreModule/components/ui/card.tsx";

const FINANCE_TAB_QUERY = "financeTab";

/** Props merged into `CardAndTableView` POST body — kept in sync so clearing toolbar drops stale IDs. */
const UNIT_COST_LIST_SYNC_KEYS = ["unitId", "verificationStatus", "paymentStatus"] as const;

type AllUnitCostsProps = WithLanguageType & {
    unitId?: string;
    unitName?: string;
};

function AllUnitCosts({ resolveLanguageKey, unitId, unitName }: AllUnitCostsProps) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { create, read } = useAccess("unitCosts");
    const [sheetCost, setSheetCost] = useState<UnitCost | null>(null);
    const [action, setAction] = useState<string>("");
    const [financeDraft, setFinanceDraft] = useState(emptyFinanceToolbarValues);
    const [financeApplied, setFinanceApplied] = useState(emptyFinanceToolbarValues);

    useEffect(() => {
        const verificationStatus = searchParams.get("verificationStatus")?.trim() ?? "";
        const paymentStatus = searchParams.get("paymentStatus")?.trim() ?? "";
        if (!verificationStatus && !paymentStatus) return;
        const seeded = {
            ...emptyFinanceToolbarValues(),
            verificationStatus,
            paymentStatus,
        };
        setFinanceDraft(seeded);
        setFinanceApplied(seeded);
    }, [searchParams]);

    const financeTab = searchParams.get(FINANCE_TAB_QUERY) === "calendar" ? "calendar" : "expenses";

    const setFinanceTab = (value: string) => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                if (value === "expenses") {
                    next.delete(FINANCE_TAB_QUERY);
                } else {
                    next.set(FINANCE_TAB_QUERY, value);
                }
                return next;
            },
            { replace: true },
        );
    };

    const listRef = useRef<{
        refetch: () => void;
        updateRow: (id: string | number, patch: Partial<UnitCost>) => void;
    } | null>(null);

    const handleDelete = (cost: UnitCost, response?: DeletedData) => {
        if (response?.deletedAt != null || response?.deletedBy != null) {
            listRef.current?.updateRow?.(cost._id, {
                deletedAt: response.deletedAt,
                deletedBy: response.deletedBy,
            } as Partial<UnitCost>);
            if (!!sheetCost) {
                setSheetCost({
                    ...sheetCost,
                    deletedAt: response.deletedAt,
                    deletedBy: response.deletedBy,
                });
            }
            return;
        }
        listRef.current?.refetch?.();
    };

    const handleRestore = (cost: UnitCost) => {
        listRef.current?.updateRow?.(cost._id, { deletedAt: undefined, deletedBy: undefined } as Partial<UnitCost>);
        if (!!sheetCost) {
            setSheetCost({
                ...sheetCost,
                deletedAt: undefined,
                deletedBy: undefined,
            });
        }
    };

    const createLabelKey = financeTab === "expenses" ? "createUnitCostExpenses" : "createUnitCost";

    const expenseExtraFilters = useMemo(() => {
        const next: Record<string, unknown> = {};
        const resolvedUnitId = (unitId?.trim() || financeApplied.unitId?.trim()) ?? "";
        if (resolvedUnitId) next.unitId = resolvedUnitId;
        const verification = financeApplied.verificationStatus?.trim();
        if (verification) next.verificationStatus = verification;
        const paymentSt = financeApplied.paymentStatus?.trim();
        if (paymentSt) next.paymentStatus = paymentSt;
        return next;
    }, [unitId, financeApplied]);

    const toolbarDslMerged = useMemo(
        () =>
            buildFinanceToolbarOnlyFilterGroup({
                vendorContains: financeApplied.vendorContains,
                purchasePersonId: financeApplied.purchasePersonId,
            }),
        [financeApplied.vendorContains, financeApplied.purchasePersonId],
    );

    const clearFinanceFilters = () => {
        const cleared = emptyFinanceToolbarValues();
        setFinanceDraft(cleared);
        setFinanceApplied(cleared);
    };

    return (
        <div className="flex-full gap-4">
            <Header
                title={buildTitleBreadcrumb(resolveLanguageKey("title"), [unitName])}
                description={unitId ? resolveLanguageKey("descriptionWithContext") : resolveLanguageKey("description")}
            >
                <div className="flex gap-2">
                    <HiddenElement hideAll={true}>
                        {create && (
                            <Button
                                type="button"
                                onClick={(e) => {
                                    const params = new URLSearchParams();
                                    if (unitId) params.set("unitId", unitId);
                                    if (unitName) params.set("unitName", unitName);
                                    navigate(`/realEstate/unitCosts/create?${params.toString()}`);
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                            >
                                <IconTextPlus className="h-4 w-4" />
                                {resolveLanguageKey(createLabelKey)}
                            </Button>
                        )}
                    </HiddenElement>
                </div>
            </Header>

            <Tabs value={financeTab} onValueChange={setFinanceTab} className="flex w-full min-w-0 flex-col gap-4">
                <TabsList variant="line" className="h-auto w-fit gap-0 border-b bg-transparent p-0">
                    <TabsTrigger className="cursor-pointer flex-none shrink-0 px-3 py-2" value="calendar">
                        {resolveLanguageKey("tabs.calendar")}
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer flex-none shrink-0 px-3 py-2" value="expenses">
                        {resolveLanguageKey("tabs.expenses")}
                    </TabsTrigger>
                </TabsList>

                <FinanceUnitCostFilterBar
                    lockedUnitId={unitId}
                    value={financeDraft}
                    onChange={setFinanceDraft}
                    onApply={() => setFinanceApplied({ ...financeDraft })}
                    onClear={clearFinanceFilters}
                    resolveLanguageKey={resolveLanguageKey}
                />

                <TabsContent value="calendar" className="mt-0 flex flex-col gap-4">
                    <PaymentCalendarTab embeddedUnitId={unitId} appliedFinanceFilters={financeApplied} />
                </TabsContent>

                <TabsContent value="expenses" className="mt-0 flex flex-col gap-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {resolveLanguageKey("expenses.summaryTotal")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-semibold tabular-nums">{resolveLanguageKey("expenses.placeholder")}</p>
                                <p className="text-xs text-muted-foreground">{resolveLanguageKey("expenses.placeholder")}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {resolveLanguageKey("expenses.summarySuppliers")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-semibold tabular-nums">{resolveLanguageKey("expenses.placeholder")}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {resolveLanguageKey("expenses.summaryPeriod")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm font-medium tabular-nums">{resolveLanguageKey("expenses.periodRange")}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <HiddenElement hideAll={true}>
                        {read && (
                            <CardAndTableView<TableResponse<UnitCost>, TableForm>
                                url="/api/realEstate/unit/cost"
                                listRef={listRef}
                                tableConfigKey="unitcosts"
                                access="unitCosts"
                                tableConfigOptions={{
                                    filterConfig: {
                                        placeholder: resolveLanguageKey("searchPlaceholder"),
                                        fields: resolveLanguageKey("fields"),
                                    },
                                }}
                                toolbarFilterDSL={toolbarDslMerged}
                                extraFilters={expenseExtraFilters}
                                syncExtraFiltersKeys={UNIT_COST_LIST_SYNC_KEYS}
                                configurations={{ limit: 20 }}
                                containersClassName={{
                                    cardViewClassName: cn(GRID_TRANSACTIONAL, "mt-0.5"),
                                    scrollRootClassName: "flex-full",
                                }}
                                renderFunctions={{
                                    cardRender: (cost) => (
                                        <UnitCostCard
                                            unitCost={cost}
                                            unitId={unitId ?? ""}
                                            unitName={unitName ?? ""}
                                            hideActions={false}
                                            onDelete={handleDelete}
                                            onRestore={() => handleRestore(cost)}
                                        />
                                    ),
                                    action: (cost) => (
                                        <ActionMenu
                                            accessModel="unitCosts"
                                            deletedData={cost}
                                            onAction={(a: string) => {
                                                setAction(a);
                                                setSheetCost(cost);
                                            }}
                                            editPath={buildUnitCostEditPath(cost, unitId ?? "", unitName)}
                                        />
                                    ),
                                }}
                            />
                        )}
                    </HiddenElement>
                </TabsContent>
            </Tabs>

            {!!action && !!sheetCost && (
                <>
                    {action === "view" && (
                        <UnitCostSheetView
                            open={action === "view"}
                            onOpenChange={(open: boolean) => {
                                if (!open) {
                                    setAction("");
                                    setSheetCost(null);
                                }
                            }}
                            unitCost={sheetCost}
                            unitId={unitId ?? ""}
                            unitName={unitName ?? ""}
                            onDelete={(data: DeletedData) => {
                                handleDelete(sheetCost, data);
                            }}
                            onRestore={() => {
                                handleRestore(sheetCost);
                            }}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="unitCosts"
                            deleteId={sheetCost._id}
                            openAlert={action === "delete"}
                            name={read?.name && sheetCost.name}
                            confirmName={read?.name && sheetCost.name}
                            onSuccess={(data: DeletedData) => {
                                handleDelete(sheetCost, data);
                                setAction("");
                                setSheetCost(null);
                            }}
                            onCancel={() => {
                                setAction("");
                                setSheetCost(null);
                            }}
                            url="/api/realEstate/unit/cost"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="unitCosts"
                            deleteId={sheetCost._id}
                            openAlert={action === "restore"}
                            name={read?.name && sheetCost.name}
                            confirmName={read?.name && sheetCost.name}
                            onSuccess={() => {
                                handleRestore(sheetCost);
                                setAction("");
                                setSheetCost(null);
                            }}
                            onCancel={() => {
                                setAction("");
                                setSheetCost(null);
                            }}
                            url="/api/realEstate/unit/cost/restore"
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/unitCosts/index.tsx"),
    withDebug(true, true),
)(AllUnitCosts);
