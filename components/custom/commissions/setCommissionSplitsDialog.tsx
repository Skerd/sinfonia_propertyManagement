import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import {LoaderCircle, Plus, Users, X} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {ApiSelect} from "@coreModule/components/viewEngine/widgets/inputs/apiSelect/apiSelect.tsx";
import {Commission} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.dto.ts";
import type {CommissionSplitFormRow, SetCommissionSplitsForm} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/setCommissionSplits.form.type.ts";
import {COMMISSION_SPLIT_LABEL_MAX, COMMISSION_SPLITS_MAX} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.schema-def.ts";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";

type SetCommissionSplitsDialogProps = WithLanguageType &
    WithAxiosType<Commission, SetCommissionSplitsForm> & {
        open: boolean;
        onClose: () => void;
        commission: Commission;
        onSuccess?: (updated?: Commission) => void;
    };

function rowsFromCommission(commission: Commission): CommissionSplitFormRow[] {
    if (!commission.splits?.length) return [];
    return commission.splits.map((split) => ({
        agentId: split.agent?._id ?? "",
        label: split.label,
        ratePercent: split.ratePercent,
        amount: split.amount,
    }));
}

function emptyRow(): CommissionSplitFormRow {
    return {agentId: "", ratePercent: 0, amount: 0};
}

function SetCommissionSplitsDialog({
    commission,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: SetCommissionSplitsDialogProps) {
    const [rows, setRows] = useState<CommissionSplitFormRow[]>(() => rowsFromCommission(commission));
    const [forceReload, setForceReload] = useState(0);

    useImperativeHandle(innerRef, () => ({
        success: (data: Commission) => {
            onSuccess?.(data);
            onClose();
        },
    }));

    useEffect(() => {
        if (open) {
            setRows(rowsFromCommission(commission));
            setForceReload((prev) => prev + 1);
        }
    }, [open, commission]);

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const totalAmount = commission.amount;
    const splitsTotal = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const exceedsTotal = splitsTotal > totalAmount + 0.005;
    const missingAgent = rows.some((row) => !row.agentId);
    const symbol = commission.currency?.symbol;
    const remaining = totalAmount - splitsTotal;

    const updateRow = (index: number, patch: Partial<CommissionSplitFormRow>) => {
        setRows((prev) => prev.map((row, i) => (i === index ? {...row, ...patch} : row)));
    };

    const handleSubmit = () => {
        if (exceedsTotal || missingAgent) return;
        onFilterChange({
            _id: commission._id,
            splits: rows.map((row) => ({
                agentId: row.agentId,
                label: row.label?.trim() || undefined,
                ratePercent: Number(row.ratePercent) || 0,
                amount: Number(row.amount) || 0,
            })),
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>{resolveLanguageKey("dialogTitle")}</DialogTitle>
                    <DialogDescription>{resolveLanguageKey("dialogDescription")}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-y-4 py-2">
                    <p className="text-sm text-muted-foreground">
                        {resolveLanguageKey("totalLabel")}{" "}
                        <span className="tabular-nums text-foreground">
                            {formatNumber(totalAmount, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            {symbol ? ` ${symbol}` : ""}
                        </span>
                        {" · "}
                        {resolveLanguageKey("allocatedLabel")}{" "}
                        <span className="tabular-nums text-foreground">
                            {formatNumber(splitsTotal, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            {symbol ? ` ${symbol}` : ""}
                        </span>
                        {" · "}
                        {resolveLanguageKey("remainingLabel")}{" "}
                        <span className="tabular-nums text-foreground">
                            {formatNumber(remaining, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            {symbol ? ` ${symbol}` : ""}
                        </span>
                    </p>
                    {exceedsTotal && (
                        <p className="text-sm text-destructive">{resolveLanguageKey("exceedsTotal")}</p>
                    )}
                    {rows.map((row, index) => (
                        <div key={`split-${index}`} className="flex flex-col gap-y-2 rounded-md border p-3">
                            <div className="flex items-center justify-between">
                                <Label>{resolveLanguageKey("agentLabel")}</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                                    disabled={loading}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <ApiSelect
                                apiUrl="/api/company/users/select"
                                postBody={{administration: true}}
                                value={row.agentId || undefined}
                                onValueChange={(value: string | string[]) =>
                                    updateRow(index, {agentId: Array.isArray(value) ? value[0] ?? "" : value || ""})
                                }
                                placeholder={resolveLanguageKey("agentPlaceholder")}
                                disabled={loading}
                                pageSize={50}
                                forceLoad={forceReload}
                            />
                            <div className="flex flex-col gap-y-2">
                                <Label>{resolveLanguageKey("labelLabel")}</Label>
                                <Input
                                    value={row.label ?? ""}
                                    onChange={(e) => updateRow(index, {label: e.target.value.slice(0, COMMISSION_SPLIT_LABEL_MAX)})}
                                    placeholder={resolveLanguageKey("labelPlaceholder")}
                                    disabled={loading}
                                    maxLength={COMMISSION_SPLIT_LABEL_MAX}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-y-2">
                                    <Label>{resolveLanguageKey("rateLabel")}</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        step="0.01"
                                        value={row.ratePercent}
                                        onChange={(e) => updateRow(index, {ratePercent: Number(e.target.value)})}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col gap-y-2">
                                    <Label>{resolveLanguageKey("amountLabel")}</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={row.amount}
                                        onChange={(e) => updateRow(index, {amount: Number(e.target.value)})}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setRows((prev) => [...prev, emptyRow()])}
                        disabled={loading || rows.length >= COMMISSION_SPLITS_MAX}
                    >
                        <Plus className="h-4 w-4" />
                        {resolveLanguageKey("addSplit")}
                    </Button>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={loading || exceedsTotal || missingAgent}>
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : <Users className="h-4 w-4" />}
                        {resolveLanguageKey("submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/commissions/setCommissionSplitsDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/commission/setSplits",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "commissions"),
)(SetCommissionSplitsDialog);
