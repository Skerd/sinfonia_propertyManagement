import { useEffect, useId, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { Unit } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import type { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@coreModule/components/ui/form.tsx";
import { Input } from "@coreModule/components/ui/input.tsx";
import { Label } from "@coreModule/components/ui/label.tsx";

export type LocalDiscountFieldProps = {
    name?: string;
    label?: string;
    placeholder?: string;
    resolveLanguageKey: WithLanguageType["resolveLanguageKey"];
    loading?: boolean;
    disabled?: boolean;
    step?: string | number;
    min?: number;
    max?: number;
    formExtras?: Record<string, unknown>;
};

function round2(n: number) {
    return Math.round(n * 100) / 100;
}

function formUnitId(value: unknown): string | undefined {
    if (typeof value === "string" && value.length > 0) return value;
    if (typeof value !== "object" || value === null || !("_id" in value)) return undefined;
    const id = value._id;
    if (typeof id === "string" && id.length > 0) return id;
    return undefined;
}

function listedUnitPrice(unit: Unit | null): number {
    if (!unit) return 0;
    const n = Number(unit.price);
    return Number.isFinite(n) && n > 0 ? n : 0;
}

function percentFromAmount(amount: number, price: number) {
    return round2(Math.min(100, Math.max(0, (amount / price) * 100)));
}

function amountFromPercent(percent: number, price: number) {
    return round2((price * percent) / 100);
}

function extrasListedPrice(formExtras: Record<string, unknown> | undefined): number {
    if (!formExtras) return 0;
    const n = Number(formExtras.listedUnitPrice);
    return Number.isFinite(n) && n > 0 ? n : 0;
}

function extrasCurrencySymbol(formExtras: Record<string, unknown> | undefined): string | undefined {
    if (!formExtras) return undefined;
    const s = formExtras.listedUnitCurrencySymbol;
    return typeof s === "string" && s.length > 0 ? s : undefined;
}

/**
 * Compound form widget: UI-only discount amount next to posted `localDiscount` (%).
 * Amount is local React state and is never registered on the form.
 */
export default function LocalDiscountField({
    name = "localDiscount",
    label,
    placeholder,
    resolveLanguageKey,
    loading,
    disabled,
    step = "0.01",
    min = 0,
    max = 100,
    formExtras,
}: LocalDiscountFieldProps) {
    const form = useFormContext();
    const unitId = formUnitId(form.watch("unit")) ?? formUnitId(formExtras?.unit);

    const [unit, setUnit] = useState<Unit | null>(null);
    const [amountText, setAmountText] = useState("");
    const lastEdited = useRef<"amount" | "percent" | null>(null);
    const amountInputId = useId();

    const priceFromExtras = extrasListedPrice(formExtras);
    const price = priceFromExtras > 0 ? priceFromExtras : listedUnitPrice(unit);
    const fieldsDisabled = Boolean(loading || disabled);

    const currencySymbol = extrasCurrencySymbol(formExtras) ?? unit?.priceCurrency?.symbol;
    const amountLabel = resolveLanguageKey("form.localDiscountAmountLabel");
    const amountPlaceholder = resolveLanguageKey("form.localDiscountAmountPlaceholder");

    useEffect(() => {
        if (!unitId) {
            if (priceFromExtras <= 0) {
                lastEdited.current = null;
                setUnit(null);
                setAmountText("");
            }
            return;
        }
        const keepTypedAmount = lastEdited.current === "amount";
        if (!keepTypedAmount && priceFromExtras <= 0) {
            lastEdited.current = null;
            setAmountText("");
        }
        let cancelled = false;
        apiClient
            .post<Unit>("/api/realEstate/unit/single", { _id: unitId })
            .then((res) => {
                if (!cancelled) setUnit(res.data);
            })
            .catch(() => {
                if (!cancelled) setUnit(null);
            });
        return () => {
            cancelled = true;
        };
    }, [unitId]);

    useEffect(() => {
        if (price <= 0) return;
        if (lastEdited.current === "amount") {
            const amount = Number(amountText);
            if (!Number.isFinite(amount) || amountText.trim() === "") return;
            form.setValue(name, percentFromAmount(amount, price), {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
            return;
        }
        const pct = Number(form.getValues(name));
        if (!Number.isFinite(pct) || pct === 0) return;
        setAmountText(String(amountFromPercent(pct, price)));
    }, [price]);

    return (
        <FormField
            control={form.control}
            name={name}
            disabled={fieldsDisabled}
            render={({ field }) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 items-start gap-4">
                    <FormItem>
                        <Label htmlFor={amountInputId}>
                            {currencySymbol ? `${amountLabel} (${currencySymbol})` : amountLabel}
                        </Label>
                        <Input
                            id={amountInputId}
                            type="number"
                            inputMode="decimal"
                            step={step}
                            min={0}
                            disabled={fieldsDisabled}
                            placeholder={amountPlaceholder}
                            value={amountText}
                            onChange={(e) => {
                                const raw = e.target.value;
                                lastEdited.current = "amount";
                                setAmountText(raw);
                                if (raw.trim() === "") {
                                    field.onChange(undefined);
                                    return;
                                }
                                if (price <= 0) return;
                                const amount = Number(raw);
                                if (!Number.isFinite(amount)) return;
                                field.onChange(percentFromAmount(amount, price));
                            }}
                        />
                    </FormItem>
                    <FormItem>
                        {label && (
                            <FormLabel>
                                <span>{label}</span>
                            </FormLabel>
                        )}
                        <FormControl>
                            <Input
                                type="number"
                                inputMode="decimal"
                                step={step}
                                min={min}
                                max={max}
                                placeholder={placeholder}
                                disabled={fieldsDisabled}
                                name={field.name}
                                ref={field.ref}
                                onBlur={field.onBlur}
                                value={field.value ?? ""}
                                onChange={(e) => {
                                    lastEdited.current = "percent";
                                    const raw = e.target.value;
                                    if (raw === "") {
                                        field.onChange(undefined);
                                        setAmountText("");
                                        return;
                                    }
                                    const pct = parseFloat(raw);
                                    field.onChange(Number.isFinite(pct) ? pct : undefined);
                                    if (price > 0 && Number.isFinite(pct)) {
                                        setAmountText(String(amountFromPercent(pct, price)));
                                    }
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </div>
            )}
        />
    );
}
