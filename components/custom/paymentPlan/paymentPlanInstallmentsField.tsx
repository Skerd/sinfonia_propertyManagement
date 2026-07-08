import { useEffect, useMemo, useRef } from "react";
import { Plus, X } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import { Button } from "@coreModule/components/ui/button.tsx";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@coreModule/components/ui/form.tsx";
import { Input } from "@coreModule/components/ui/input.tsx";
import TitleWithCollapse from "@coreModule/components/custom/titleWithCollapse.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {DateInput} from "@coreModule/components/custom/dateInput.tsx";

export type PaymentPlanInstallmentsFieldProps = {
    name?: string;
    label?: string;
    resolveLanguageKey: WithLanguageType["resolveLanguageKey"];
    loading?: boolean;
};

function utcDayMsFromIso(iso: string): number {
    const p = iso.trim().split("-").map((x) => Number.parseInt(x, 10));
    if (p.length !== 3 || p.some((n) => Number.isNaN(n))) return Number.NaN;
    return Date.UTC(p[0], p[1] - 1, p[2]);
}

function isoDateFromUtcMs(ms: number): string {
    const d = new Date(ms);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** `n` due dates from `(start, end]`, last exactly `endIso` (UTC calendar days). */
function interpolatedDueDates(startIso: string, endIso: string, n: number): string[] {
    if (n < 1) return [];
    const a = utcDayMsFromIso(startIso);
    const b = utcDayMsFromIso(endIso);
    if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return [];
    const out: string[] = [];
    for (let i = 1; i <= n; i++) {
        const ms = i === n ? b : Math.round(a + ((b - a) * i) / n);
        out.push(isoDateFromUtcMs(ms));
    }
    return out;
}

/**
 * Compound form widget: editable installment schedule (amount, due date, notes).
 * Principal / interest amounts are computed elsewhere (`paymentPlanSaleReceiptSection`).
 */
export default function PaymentPlanInstallmentsField({
    name = "installments",
    label,
    resolveLanguageKey,
    loading,
}: PaymentPlanInstallmentsFieldProps) {

    const form = useFormContext();
    const { control } = useFormContext();
    const { fields, append, remove, replace } = useFieldArray({ control, name: name as "installments" });
    const numberOfInstallments = form.watch("numberOfInstallments");
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    const installments = form.watch("installments");

    const structuredPlan = useMemo(() => {
        const n = Math.floor(Number(numberOfInstallments) || 0);
        return n >= 1 && String(startDate || "").trim().length > 0 && String(endDate || "").trim().length > 0;
    }, [numberOfInstallments, startDate, endDate]);

    /** Only full `replace` when plan shape (n/start/end) or row count changes — not when user edits earlier due dates. */
    const structuredPlanKeyRef = useRef<string | null>(null);

    useEffect(() => {
        if (!structuredPlan) {
            structuredPlanKeyRef.current = null;
            return;
        }
        const n = Math.max(1, Math.floor(Number(numberOfInstallments) || 0));
        const s = String(startDate || "").trim();
        const e = String(endDate || "").trim();
        const dates = interpolatedDueDates(s, e, n);
        if (dates.length !== n) return;

        const planKey = `${n}|${s}|${e}`;
        const prevRows = form.getValues(name as "installments") as Array<{
            installmentNumber?: number;
            dueDate?: string;
            amount?: number;
            notes?: string;
        }>;

        const lengthMismatch = !Array.isArray(prevRows) || prevRows.length !== n;
        const structureChanged = structuredPlanKeyRef.current !== planKey;
        structuredPlanKeyRef.current = planKey;

        if (lengthMismatch || structureChanged) {
            const next = dates.map((dueDate, idx) => ({
                installmentNumber: idx + 1,
                dueDate,
                amount: prevRows?.[idx]?.amount,
                notes: prevRows?.[idx]?.notes,
            }));
            replace(next as never);
            return;
        }

        // Same n/start/end and row count: keep user-edited due dates; only lock last row to plan end date.
        const lastIdx = n - 1;
        const expectedLast = dates[lastIdx];
        const currentLast = String(prevRows[lastIdx]?.dueDate || "").trim();
        if (currentLast !== expectedLast) {
            form.setValue(`${name}.${lastIdx}.dueDate` as never, expectedLast as never, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [structuredPlan, numberOfInstallments, startDate, endDate, name, replace, form]);

    useEffect(() => {
        if (!Array.isArray(installments)) return;
        for (let i = 1; i < installments.length; i++) {
            const prevDueDate = installments[i - 1]?.dueDate;
            const currentDueDate = installments[i]?.dueDate;
            const path = `${name}.${i}.dueDate` as const;

            if (typeof prevDueDate !== "string" || typeof currentDueDate !== "string") {
                form.clearErrors(path);
                continue;
            }

            if (currentDueDate.length === 0 || prevDueDate.length === 0) {
                form.clearErrors(path);
                continue;
            }

            // `yyyy-MM-dd` compares chronologically as string.
            if (currentDueDate <= prevDueDate) {
                const dueDateLabel = String(resolveLanguageKey("form.dueDateLabel"));
                form.setError(path, {
                    type: "custom",
                    message: String(resolveLanguageKey("form.dueDateAfterPreviousError"))
                        .replace("{}", dueDateLabel)
                        .replace("{}", `${dueDateLabel} #${i}`),
                });
            } else {
                form.clearErrors(path);
            }
        }
    }, [installments, form, name, resolveLanguageKey]);

    return (
        <TitleWithCollapse
            title={label}
            inBetween={
                structuredPlan ? undefined : (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                    >
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={loading}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                append({ installmentNumber: fields.length + 1 });
                            }}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            {resolveLanguageKey("form.addInstallment")}
                        </Button>
                    </div>
                )
            }
        >
            <div className="space-y-3" style={{border: "0px solid red"}}>
                {
                    installments && fields.map((field, index) => {
                        return (
                            <div key={field.id} className="p-4 border rounded-lg space-y-3 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">
                                        {resolveLanguageKey("form.installment")} {index + 1}
                                    </p>
                                    {fields.length > 1 && !structuredPlan && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={loading}
                                            onClick={() => remove(index)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                                    {/*<div>*/}
                                    {/*    <FormField*/}
                                    {/*        control={control}*/}
                                    {/*        name={`${name}.${index}.installmentNumber` as const}*/}
                                    {/*        render={({ field: f }) => (*/}
                                    {/*            <FormItem>*/}
                                    {/*                <FormLabel>{resolveLanguageKey("form.installmentNumberLabel")}</FormLabel>*/}
                                    {/*                <FormControl>*/}
                                    {/*                    <Input*/}
                                    {/*                        type="number"*/}
                                    {/*                        disabled={loading}*/}
                                    {/*                        {...f}*/}
                                    {/*                        onChange={(e) =>*/}
                                    {/*                            f.onChange(e.target.value ? parseInt(e.target.value, 10) : 1)*/}
                                    {/*                        }*/}
                                    {/*                        min={1}*/}
                                    {/*                        value={f.value ?? ""}*/}
                                    {/*                    />*/}
                                    {/*                </FormControl>*/}
                                    {/*                <FormMessage />*/}
                                    {/*            </FormItem>*/}
                                    {/*        )}*/}
                                    {/*    />*/}
                                    {/*</div>*/}
                                    <div>
                                        <FormField
                                            control={control}
                                            name={`${name}.${index}.dueDate`}
                                            render={({ field: f }) => (
                                                <FormItem>
                                                    <FormLabel>{resolveLanguageKey("form.dueDateLabel")}</FormLabel>
                                                    <FormControl>
                                                        <DateInput
                                                            disabled={
                                                                loading ||
                                                                (structuredPlan && index === fields.length - 1)
                                                            }
                                                            {...f}
                                                            value={f.value || ""}
                                                            valueFormat="yyyy-MM-dd"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <FormField
                                            control={control}
                                            name={`${name}.${index}.amount` as const}
                                            render={({ field: f }) => (
                                                <FormItem>
                                                    <FormLabel>{resolveLanguageKey("form.amountLabel")}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            disabled={loading}
                                                            {...f}
                                                            placeholder={resolveLanguageKey("form.amountPlaceholder")}
                                                            onChange={(e) =>
                                                                f.onChange(e.target.value ? parseFloat(e.target.value) : 0)
                                                            }
                                                            value={f.value ?? ""}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <FormField
                                            control={control}
                                            name={`${name}.${index}.notes` as const}
                                            render={({ field: f }) => (
                                                <FormItem className="sm:col-span-2 lg:col-span-4">
                                                    <FormLabel>{resolveLanguageKey("form.notesLabel")}</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            disabled={loading}
                                                            {...f}
                                                            value={f.value || ""}
                                                            className="resize-none max-h-[250px] overflow-y-auto"
                                                            placeholder={String(resolveLanguageKey("form.notesPlaceholder"))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </TitleWithCollapse>
    );
}
