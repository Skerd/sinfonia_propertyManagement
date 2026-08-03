import { useEffect, useMemo, useState } from "react";
import {UseFormReturn, useWatch} from "react-hook-form";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import { Unit, Unit as UnitData } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import { useAccess } from "@coreModule/helpers/hocs/withAccess.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import { ErrorView } from "@coreModule/components/custom/errorView.tsx";
import ReservationCard from "@propertyManagementModule/clients/panel/private/reservations/center/cardView/reservationCard.tsx";
import { Reservation } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import { cn } from "@coreModule/components/lib/utils.ts";
import { AlertCircleIcon, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@coreModule/components/ui/alert.tsx";
import { Card, CardContent, CardFooter, CardHeader } from "@coreModule/components/ui/card.tsx";
import type { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Currency} from "armonia/src/modules/core/api/finance/private/currency/currency.dto.ts";

const PRINCIPAL_ZERO_EPS = 0.02;

function roundMoney(value: number): number {
    return Number((Number.isFinite(value) ? value : 0).toFixed(2));
}

type AmortizationRowOutput = {
    installmentNumber: number;
    dueDate: string;
    amount: number;
    notes?: string;
    principalAmount: number;
    interestAmount: number;
    interestRate?: number;
    gracePeriodDays?: number;
    lateFeePercentage?: number;
};

type AmortizationResult =
    | { ok: true; installments: AmortizationRowOutput[]; totalContractInterest: number; planDays: number }
    | { ok: false; code: "invalid_input" | "installment_too_small" | "principal_residual" | "overpayment" };

type RowWithFormIdx = {
    installmentNumber: number;
    dueDate: string;
    amount: number;
    notes?: string;
    __formIdx: number;
};

function dayUtcMs(isoDate: string): number {
    const parts = isoDate.trim().split("-").map((x) => Number.parseInt(x, 10));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return Number.NaN;
    const [y, m, d] = parts;
    return Date.UTC(y, m - 1, d);
}

function daysBetweenUtc(fromIso: string, toIso: string): number {
    const from = dayUtcMs(fromIso);
    const to = dayUtcMs(toIso);
    if (Number.isNaN(from) || Number.isNaN(to)) return Number.NaN;
    return Math.round((to - from) / 86400000);
}

function computeSimpleAmortization(params: {
    financedPrincipal: number;
    annualRatePercent: number;
    planStartDate: string;
    planEndDate: string;
    rows: Array<{ installmentNumber: number; dueDate: string; amount: number; notes?: string }>;
    interestRatePerInstallment?: number;
    gracePeriodDays?: number;
    lateFeePercentage?: number;
}): AmortizationResult {
    const principal = roundMoney(params.financedPrincipal);
    if (!Number.isFinite(principal) || principal < 0) return { ok: false, code: "invalid_input" };
    if (!params.planStartDate?.trim() || !params.planEndDate?.trim() || params.rows.length === 0) {
        return { ok: false, code: "invalid_input" };
    }

    const planStart = params.planStartDate.trim();
    const planEnd = params.planEndDate.trim();
    const planDays = daysBetweenUtc(planStart, planEnd);
    if (Number.isNaN(planDays) || planDays <= 0) return { ok: false, code: "invalid_input" };

    const rowsWithIdx: RowWithFormIdx[] = params.rows.map((r, idx) => ({
        installmentNumber: r.installmentNumber,
        dueDate: r.dueDate,
        amount: r.amount,
        notes: r.notes,
        __formIdx: idx,
    }));

    const sortedRows = [...rowsWithIdx].sort((a, b) => {
        const da = dayUtcMs(a.dueDate);
        const db = dayUtcMs(b.dueDate);
        if (da !== db) return da - db;
        return a.installmentNumber - b.installmentNumber;
    });

    for (const row of sortedRows) {
        if (Number.isNaN(dayUtcMs(row.dueDate))) return { ok: false, code: "invalid_input" };
        if (roundMoney(Number(row.amount) || 0) <= 0) return { ok: false, code: "invalid_input" };
    }

    const planEndMs = dayUtcMs(planEnd);
    const planStartMs = dayUtcMs(planStart);
    if (Number.isNaN(planEndMs) || Number.isNaN(planStartMs)) return { ok: false, code: "invalid_input" };

    let prevDueMs = Number.NEGATIVE_INFINITY;
    const segmentDays: number[] = [];
    for (let i = 0; i < sortedRows.length; i++) {
        const due = sortedRows[i].dueDate.trim();
        const dueMs = dayUtcMs(due);
        if (Number.isNaN(dueMs) || dueMs < planStartMs || dueMs > planEndMs) return { ok: false, code: "invalid_input" };
        if (dueMs <= prevDueMs) return { ok: false, code: "invalid_input" };
        prevDueMs = dueMs;
        const prevIso = i === 0 ? planStart : sortedRows[i - 1].dueDate.trim();
        const d = daysBetweenUtc(prevIso, due);
        if (Number.isNaN(d) || d < 0) return { ok: false, code: "invalid_input" };
        segmentDays.push(d);
    }

    const lastDue = sortedRows[sortedRows.length - 1].dueDate.trim();
    const spanDays = daysBetweenUtc(planStart, lastDue);
    if (Number.isNaN(spanDays) || spanDays !== planDays) return { ok: false, code: "invalid_input" };

    const rate = (Number(params.annualRatePercent) || 0) / 100;
    const totalContractInterest = rate <= 0 || principal <= 0 ? 0 : roundMoney(principal * rate * (planDays / 365));

    const n = sortedRows.length;
    const allocatedInterest: number[] = [];
    let interestSum = 0;
    for (let i = 0; i < n - 1; i++) {
        const part =
            planDays <= 0 ? 0 : roundMoney((totalContractInterest * segmentDays[i]) / planDays);
        allocatedInterest.push(part);
        interestSum += part;
    }
    allocatedInterest.push(roundMoney(totalContractInterest - interestSum));

    let remaining = principal;
    const outSorted: AmortizationRowOutput[] = [];

    for (let i = 0; i < sortedRows.length; i++) {
        const row = sortedRows[i];
        const amount = roundMoney(Number(row.amount) || 0);
        const interestAccrued = allocatedInterest[i] ?? 0;
        const rawPrincipal = roundMoney(amount - interestAccrued);
        if (rawPrincipal < -0.005) return { ok: false, code: "installment_too_small" };

        let principalAmount: number;
        if (rawPrincipal > remaining + 0.005) {
            principalAmount = roundMoney(Math.max(0, remaining));
        } else {
            principalAmount = rawPrincipal;
        }
        principalAmount = Math.max(0, Math.min(principalAmount, roundMoney(remaining)));
        const interestAmount = roundMoney(amount - principalAmount);

        remaining = roundMoney(remaining - principalAmount);
        if (remaining < -0.02) {
            return { ok: false, code: "overpayment" };
        }
        remaining = Math.max(0, remaining);

        outSorted.push({
            installmentNumber: row.installmentNumber,
            dueDate: row.dueDate,
            amount,
            notes: row.notes,
            principalAmount,
            interestAmount: Math.max(0, interestAmount),
            interestRate: params.interestRatePerInstallment,
            gracePeriodDays: params.gracePeriodDays,
            lateFeePercentage: params.lateFeePercentage,
        });
    }

    const installmentsInFormOrder: AmortizationRowOutput[] = new Array(params.rows.length);
    for (let j = 0; j < outSorted.length; j++) {
        installmentsInFormOrder[sortedRows[j].__formIdx] = outSorted[j];
    }

    return { ok: true, installments: installmentsInFormOrder, totalContractInterest, planDays };
}

function sortedFormIndicesByDueDate(
    installments: Array<{ installmentNumber?: number; dueDate?: unknown }>,
): number[] {
    const n = installments.length;
    return [...Array(n).keys()].sort((a, b) => {
        const da = dayUtcMs(String(installments[a]?.dueDate || ""));
        const db = dayUtcMs(String(installments[b]?.dueDate || ""));
        if (da !== db) return da - db;
        const na =
            typeof installments[a]?.installmentNumber === "number"
                ? installments[a].installmentNumber!
                : a + 1;
        const nb =
            typeof installments[b]?.installmentNumber === "number"
                ? installments[b].installmentNumber!
                : b + 1;
        return na - nb;
    });
}

export type PaymentPlanSaleReceiptSectionProps = {
    form: UseFormReturn<any>;
    setDisableSubmit: (disable: boolean) => void;
    setSaleExchangeRateVisibility: (visibility: boolean) => void;
    setReservationExchangeRateVisibility: (visibility: boolean) => void;
    resolveLanguageKey: WithLanguageType["resolveLanguageKey"];
};

/**
 * Live pricing (same rules as cash sale) plus amortized installment schedule for payment-plan sales.
 */
export default function PaymentPlanSaleReceiptSection({
    form,
    setDisableSubmit,
    setSaleExchangeRateVisibility,
    setReservationExchangeRateVisibility,
    resolveLanguageKey,
}: PaymentPlanSaleReceiptSectionProps) {
    const { read: readReservation } = useAccess("reservations");

    const unitId = form.watch("unit") as string | undefined;
    const [unit, setUnit] = useState<UnitData | null>(null);
    const [loadingUnit, setLoadingUnit] = useState(false);
    const [unitError, setUnitError] = useState(false);
    const [forceReload, setForceReload] = useState(1);

    const [currency, setCurrency] = useState<Currency | null>(null);
    const [loadingCurrency, setLoadingCurrency] = useState(false);
    const [currencyError, setCurrencyError] = useState(false);
    const [forceReloadCurrency, setForceReloadCurrency] = useState(1);

    const [reservation, setReservation] = useState<Reservation | null>(null);

    const localDiscount = form.watch("localDiscount");
    const reservationExchangeRate = form.watch("reservationExchangeRate");
    const saleCurrency = form.watch("saleCurrency");
    const saleExchangeRate = form.watch("saleExchangeRate");

    const reservationDeduction = parseFloat(reservationExchangeRate?.toString() ?? "0") * (reservation?.depositAmount ?? 0);
    const finalConversionRate = !!currency ? saleCurrency !== unit?.priceCurrency?._id?.toString() ? parseFloat(saleExchangeRate?.toString() ?? "0") || 0 : 1 : 1;
    const finalPrice = ((unit?.price || 0) - (reservationDeduction || 0) - (Number(localDiscount || 0) / 100) * (unit?.price || 0)) * finalConversionRate;

    const downPayment = form.watch("downPayment");
    const interestRate = form.watch("interestRate");
    const gracePeriodDays = form.watch("gracePeriodDays");
    const lateFeePercentage = form.watch("lateFeePercentage");
    const saleDate = form.watch("saleDate");
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    const installments = form.watch("installments");

    const [amortErrorCode, setAmortErrorCode] = useState<string | null>(null);
    const [scheduleRows, setScheduleRows] = useState<AmortizationRowOutput[]>([]);
    const [amortMeta, setAmortMeta] = useState<{ totalContractInterest: number; planDays: number } | null>(null);
    const financedAmount = roundMoney(Number(finalPrice ?? 0) - Number(downPayment ?? 0));
    const isFinancedNegative = financedAmount < 0;

    const installmentsWatch = useWatch({control: form.control, name: "installments"});

    useEffect(() => {
        if (!unitId) return;
        setLoadingUnit(true);
        setUnitError(false);
        apiClient
            .post<Unit>("/api/realEstate/unit/single", { _id: unitId })
            .then((res) => {
                setUnit(res.data);
                setUnitError(false);
                setLoadingUnit(false);
            })
            .catch(() => {
                setUnitError(true);
                setLoadingUnit(false);
            });
    }, [unitId, forceReload]);

    useEffect(() => {
        if (!saleCurrency) return;
        setLoadingCurrency(true);
        setCurrencyError(false);
        apiClient
            .post<Currency>("/api/finance/currency/single", { _id: saleCurrency })
            .then((res) => {
                setCurrency(res.data);
                setCurrencyError(false);
                setLoadingCurrency(false);
            })
            .catch(() => {
                setCurrencyError(true);
                setLoadingCurrency(false);
            });
    }, [saleCurrency, forceReloadCurrency]);

    useEffect(() => {
        if (!!reservation && !!unit) {
            if( reservation.depositCurrency?._id?.toString() !== unit.priceCurrency?._id?.toString() ){
                setReservationExchangeRateVisibility(true);
                form.setValue("reservationExchangeRate", "");
            }
            else{
                setReservationExchangeRateVisibility(false);
                form.setValue("reservationExchangeRate", 1);
            }
        }
    }, [reservation, unit, setReservationExchangeRateVisibility]);

    useEffect(() => {
        if (!!saleCurrency && !!unit) {
            if( saleCurrency !== unit.priceCurrency?._id?.toString() ){
                setSaleExchangeRateVisibility(true);
                form.setValue("saleExchangeRate", "");
            }
            else{
                setSaleExchangeRateVisibility(false);
                form.setValue("saleExchangeRate", 1);
            }
        }
    }, [saleCurrency, unit, setSaleExchangeRateVisibility]);

    useEffect(() => {
        const s = String(saleDate || "").trim();
        if (s) {
            form.setValue("startDate", s, { shouldDirty: false, shouldValidate: true });
        }
    }, [saleDate, form]);

    useEffect(() => {
        const financed = financedAmount;
        const ratePct = Number(interestRate ?? 0);
        const grace = Number(gracePeriodDays ?? 0);
        const latePct = Number(lateFeePercentage ?? 0);

        if (
            !String(startDate || "").trim() ||
            !String(endDate || "").trim() ||
            !Array.isArray(installments) ||
            installments.length === 0 ||
            isFinancedNegative
        ) {
            setAmortErrorCode(null);
            setScheduleRows([]);
            setAmortMeta(null);
            return;
        }

        const rows = (installments).map((row, idx: number) => ({
            installmentNumber: typeof row.installmentNumber === "number" ? row.installmentNumber : idx + 1,
            dueDate: String(row.dueDate || ""),
            amount: roundMoney(Number(row.amount) || 0),
            notes: row.notes ? String(row.notes) : undefined,
        }));

        if (!rows.every((r) => r.dueDate.trim().length > 0 && r.amount > 0)) {
            setAmortErrorCode(null);
            setScheduleRows([]);
            setAmortMeta(null);
            return;
        }

        const result = computeSimpleAmortization({
            financedPrincipal: financed,
            annualRatePercent: ratePct,
            planStartDate: String(startDate).trim(),
            planEndDate: String(endDate).trim(),
            rows,
            interestRatePerInstallment: ratePct,
            gracePeriodDays: grace,
            lateFeePercentage: latePct,
        });

        if (!result.ok) {
            setAmortErrorCode(result.code);
            setScheduleRows([]);
            setAmortMeta(null);
            return;
        }

        setAmortErrorCode(null);
        setScheduleRows(result.installments);
        setAmortMeta({ totalContractInterest: result.totalContractInterest, planDays: result.planDays });

        const prev = form.getValues("installments");
        if (JSON.stringify(prev) !== JSON.stringify(result.installments)) {
            // form.setValue("installments", result.installments);
        }

    }, [financedAmount, isFinancedNegative, interestRate, gracePeriodDays, lateFeePercentage, startDate, endDate, installments, installmentsWatch]);

    /** Financed principal minus sum of scheduled principal; should be ~0 for a valid payoff. */
    const principalResidualCheck = useMemo(() => {
        if (amortErrorCode || scheduleRows.length === 0) {
            return { blocksSubmit: false, residual: null as number | null };
        }
        const financed = roundMoney(Number(finalPrice ?? 0) - Number(downPayment ?? 0));
        if (!Number.isFinite(financed) || financed <= 0) {
            return { blocksSubmit: false, residual: null };
        }
        const totalPrincipal = scheduleRows.reduce((s, r) => s + (r.principalAmount ?? 0), 0);
        const residual = roundMoney(financed - totalPrincipal);
        const blocksSubmit = Math.abs(residual) > PRINCIPAL_ZERO_EPS;
        return { blocksSubmit, residual: blocksSubmit ? residual : null };
    }, [amortErrorCode, scheduleRows, finalPrice, downPayment]);

    useEffect(() => {
        setDisableSubmit(
            (!!reservation && (!readReservation.depositAmount || !readReservation.depositCurrency)) ||
            (!!saleCurrency && !currency) ||
            (!!saleCurrency && !!currency && saleCurrency !== unit?.priceCurrency?._id?.toString() && !saleExchangeRate) ||
            (!!unit?.reservation && !reservation?.paid) ||
            (!!unit?.reservation && reservation?.depositCurrency?._id?.toString() !== unit?.priceCurrency?._id?.toString() && !reservationExchangeRate) ||
            finalPrice < 0 ||
            isFinancedNegative ||
            // amortization block
            (finalPrice - downPayment) > 0.005 &&
                (!!amortErrorCode ||
                    principalResidualCheck.blocksSubmit ||
                    scheduleRows.length === 0 ||
                    !String(startDate || "").trim() ||
                    !String(endDate || "").trim() ||
                    !Array.isArray(installments) ||
                    installments.length === 0)
        );
    }, [
        readReservation,
        unitId,
        reservation,
        saleCurrency,
        currency,
        unit,
        saleExchangeRate,
        reservationExchangeRate,
        setDisableSubmit,
        finalPrice,
        isFinancedNegative,
        downPayment,
        startDate,
        endDate,
        amortErrorCode,
        principalResidualCheck.blocksSubmit,
        scheduleRows.length,
        installments,
    ]);

    const formScheduleRows = useMemo(
        () => (Array.isArray(installments) ? installments : []),
        [installments],
    );

    /**
     * Opening / after-payment principal by due-date order.
     * Principal & interest splits come only from full amortization once every installment has an amount.
     * Until then, "after payment" uses the full installment as principal (provisional) so you still see a running balance.
     */
    const scheduleOpeningAfter = useMemo(() => {
        const n = Array.isArray(installments) ? installments.length : 0;
        if (n === 0 || isFinancedNegative) return null;
        const financed = roundMoney(Number(finalPrice ?? 0) - Number(downPayment ?? 0));
        if (!Number.isFinite(financed) || financed <= 0) return null;

        const openingByForm: (number | null)[] = new Array(n).fill(null);
        const afterByForm: (number | null)[] = new Array(n).fill(null);

        const sorted = sortedFormIndicesByDueDate(installments).filter((i) => {
            const d = String(installments[i]?.dueDate || "").trim();
            return d.length > 0 && !Number.isNaN(dayUtcMs(d));
        });
        if (sorted.length === 0) return { openingByForm, afterByForm };

        let bal = financed;
        for (const fi of sorted) {
            openingByForm[fi] = bal;
            const amount = roundMoney(Number(installments[fi]?.amount) || 0);
            if (amount > 0) {
                if (!amortErrorCode && scheduleRows[fi]) {
                    const p = Math.max(0, scheduleRows[fi]!.principalAmount ?? 0);
                    bal = Math.max(0, roundMoney(bal - p));
                } else {
                    bal = Math.max(0, roundMoney(bal - amount));
                }
            }
            afterByForm[fi] = bal;
        }
        return { openingByForm, afterByForm };
    }, [
        installments,
        finalPrice,
        downPayment,
        isFinancedNegative,
        amortErrorCode,
        scheduleRows,
    ]);

    const getUnitName = (u: Unit | null) => {
        if (!u) {
            return "";
        }

        const values = [];
        if (!!u?.unitNumber) {
            values.push(u?.unitNumber);
        }
        if (!!u?.name) {
            values.push(u?.name);
        }
        if (!!u?.unitType && !!u?.unitType?.name) {
            values.push(u?.unitType?.name);
        }
        if (values.length === 0) {
            return u?._id;
        }
        return values.join(" - ");
    };

    if (!unitId) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 my-4 gap-4">

            <Card className="gap-4 lg:order-1">
                <CardHeader className="py-0">
                    <p className="text-sm font-semibold tracking-wide uppercase">
                        {resolveLanguageKey("paymentPlanScheduleTitle")}
                    </p>
                </CardHeader>
                <CardContent className="border-t px-2 w-full pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{resolveLanguageKey("financedAmountLabel")}</span>
                        <span className="font-semibold">
                            {
                                !!saleCurrency && !!currency && saleCurrency !== unit?.priceCurrency?._id?.toString() && !saleExchangeRate ?
                                <span className="text-destructive">
                                    {resolveLanguageKey("pleaseSetUnitToSaleCurrencyExchangeRate")}
                                </span>
                                :
                                isFinancedNegative ?
                                <span className="text-destructive">
                                    {financedAmount.toLocaleString()} {currency?.name || currency?.symbol || unit?.priceCurrency?.name || unit?.priceCurrency?.symbol}
                                </span>
                                :
                                <>
                                    {financedAmount.toLocaleString()} {currency?.name || currency?.symbol || unit?.priceCurrency?.name || unit?.priceCurrency?.symbol}
                                </>
                            }
                        </span>
                    </div>
                    {
                        isFinancedNegative &&
                        <Alert variant="destructive">
                            <AlertCircleIcon />
                            <AlertTitle>{resolveLanguageKey("cannotProceed")}</AlertTitle>
                            <AlertDescription>{resolveLanguageKey("form.financeNegativeError")}</AlertDescription>
                        </Alert>
                    }

                    {
                        scheduleRows.length > 0 && amortMeta && !isFinancedNegative &&
                        <>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{resolveLanguageKey("contractInterestLabel")}</span>
                                <span className="font-semibold">
                                    {amortMeta.totalContractInterest.toLocaleString()}{" "}
                                    {currency?.name || currency?.symbol || unit?.priceCurrency?.name || unit?.priceCurrency?.symbol}
                                    <span className="text-muted-foreground font-normal text-xs ml-1">
                                        ({amortMeta.planDays} {resolveLanguageKey("planDaysSuffix")})
                                    </span>
                                </span>
                            </div>
                            <div className="flex justify-between text-sm border-t pt-2">
                                <span className="text-muted-foreground">{resolveLanguageKey("totalObligationLabel")}</span>
                                <span className="font-semibold">
                                    {roundMoney(
                                        roundMoney(Number(finalPrice ?? 0) - Number(downPayment ?? 0)) +
                                            amortMeta.totalContractInterest,
                                    ).toLocaleString()}{" "}
                                    {currency?.name || currency?.symbol || unit?.priceCurrency?.name || unit?.priceCurrency?.symbol}
                                </span>
                            </div>
                        </>
                    }
                    {
                        amortErrorCode ? (
                            <Alert variant="destructive">
                                <AlertCircleIcon />
                                <AlertTitle>{resolveLanguageKey("amortizationErrorTitle")}</AlertTitle>
                                <AlertDescription>
                                    {resolveLanguageKey(`amortizationError.${amortErrorCode}`)}
                                </AlertDescription>
                            </Alert>
                        ) : null
                    }

                    {principalResidualCheck.blocksSubmit && principalResidualCheck.residual != null ? (
                        <Alert
                            className={cn(
                                "border-warning/50 bg-warning/10",
                                "dark:border-warning/40 dark:bg-warning/30",
                            )}
                        >
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            <AlertTitle className="text-warning">
                                {resolveLanguageKey("principalResidualWarningTitle")}
                            </AlertTitle>
                            <AlertDescription className="text-warning/90">
                                {resolveLanguageKey("principalResidualWarningDescription")}{" "}
                                <span className="font-semibold tabular-nums">
                                    {principalResidualCheck.residual.toLocaleString()}{" "}
                                    {currency?.symbol ||
                                        currency?.name ||
                                        unit?.priceCurrency?.symbol ||
                                        unit?.priceCurrency?.name ||
                                        ""}
                                </span>
                                . {resolveLanguageKey("principalResidualWarningHint")}
                            </AlertDescription>
                        </Alert>
                    ) : null}

                    {
                        formScheduleRows.length > 0 ? (
                            <div className="overflow-x-auto rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="p-2 text-left font-medium">{resolveLanguageKey("scheduleColNumber")}</th>
                                            <th className="p-2 text-left font-medium">{resolveLanguageKey("scheduleColDueDate")}</th>
                                            <th className="p-2 text-right font-medium">{resolveLanguageKey("scheduleColPayment")}</th>
                                            <th className="p-2 text-right font-medium">{resolveLanguageKey("scheduleColOpeningPrincipal")}</th>
                                            <th className="p-2 text-right font-medium">{resolveLanguageKey("scheduleColPrincipal")}</th>
                                            <th className="p-2 text-right font-medium">{resolveLanguageKey("scheduleColInterest")}</th>
                                            <th className="p-2 text-right font-medium">{resolveLanguageKey("scheduleColBalance")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formScheduleRows.map((row, i) => {
                                            const installmentNumber =
                                                typeof row.installmentNumber === "number" ? row.installmentNumber : i + 1;
                                            const dueDate = String(row.dueDate || "");
                                            const amount = roundMoney(Number(row.amount) || 0);
                                            const computed =
                                                !amortErrorCode && scheduleRows[i] !== undefined ? scheduleRows[i] : null;
                                            const principalAmt = computed?.principalAmount;
                                            const interestAmt = computed?.interestAmount;
                                            const openingBal = scheduleOpeningAfter?.openingByForm[i];
                                            const closingBal = scheduleOpeningAfter?.afterByForm[i];
                                            const openingStr =
                                                openingBal != null ? openingBal.toLocaleString() : "—";
                                            const closingStr =
                                                closingBal != null ? closingBal.toLocaleString() : "—";
                                            return (
                                                <tr
                                                    key={`sch-${i}-${installmentNumber}-${dueDate}`}
                                                    className={cn(
                                                        "border-t",
                                                        amortErrorCode && "bg-destructive/5",
                                                    )}
                                                >
                                                    <td className="p-2">{installmentNumber}</td>
                                                    <td className="p-2 whitespace-nowrap">
                                                        {dueDate.length > 0 ? dueDate : "—"}
                                                    </td>
                                                    <td className="p-2 text-right">
                                                        {Number.isFinite(amount) && amount > 0
                                                            ? amount.toLocaleString()
                                                            : "—"}
                                                    </td>
                                                    <td className="p-2 text-right text-muted-foreground tabular-nums">
                                                        {openingStr}
                                                    </td>
                                                    <td className="p-2 text-right text-muted-foreground">
                                                        {principalAmt != null
                                                            ? principalAmt.toLocaleString()
                                                            : "—"}
                                                    </td>
                                                    <td className="p-2 text-right text-muted-foreground">
                                                        {interestAmt != null
                                                            ? interestAmt.toLocaleString()
                                                            : "—"}
                                                    </td>
                                                    <td className="p-2 text-right text-muted-foreground tabular-nums">
                                                        {closingStr}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">{resolveLanguageKey("scheduleEmptyHint")}</p>
                        )
                    }
                </CardContent>
            </Card>

            <Card className="md:col-start-2 gap-4 lg:order-2">
                <CardHeader className="py-0">
                    <p className="text-sm font-semibold tracking-wide uppercase">
                        {resolveLanguageKey("pricingReceiptTitle")}: {getUnitName(unit)}
                    </p>
                </CardHeader>
                <CardContent className="border-t px-2 w-full pt-4">
                    {
                        loadingUnit ?
                        <Loader />
                        :
                        <>
                            {
                                unitError || !unit ?
                                <ErrorView
                                    title={resolveLanguageKey("errorTitle")}
                                    description={resolveLanguageKey("errorDescription")}
                                    tooltipDescription={resolveLanguageKey("errorTooltip")}
                                    onClick={() => {
                                        setForceReload(forceReload + 1);
                                    }}
                                />
                                :
                                <div className="text space-y-2 font-semibold">
                                    {unit?.reservation && (
                                        <ReservationCard
                                            fetchId={unit.reservation._id}
                                            hideActions={true}
                                            extraSmall={true}
                                            onReady={setReservation}
                                        />
                                    )}

                                    <Card
                                        className={cn(
                                            "group p-0 h-fit relative transition-all duration-300 hover:shadow-md hover:cursor-pointer",
                                        )}
                                    >
                                        <div className="flex flex-col w-full items-stretch p-2 space-y-2">
                                            <div className="flex justify-between">
                                                <p className="tracking-wide">{resolveLanguageKey("form.unitPriceLabel")}:</p>
                                                <p className="font-semibold text-success">
                                                    {unit?.price?.toLocaleString()} {unit?.priceCurrency?.name}
                                                </p>
                                            </div>
                                            {
                                                !!reservation &&
                                                <div className="flex justify-between">
                                                    <p className="tracking-wide">
                                                        {resolveLanguageKey("form.reservationDeductionLabel")}:
                                                    </p>
                                                    <HiddenElement>
                                                        {
                                                            readReservation.depositAmount &&
                                                            <p className="font-semibold text-destructive">
                                                                {unit?.reservation &&
                                                                reservation.depositCurrency?._id?.toString() !==
                                                                    unit.priceCurrency?._id?.toString() &&
                                                                !reservationExchangeRate ? (
                                                                    <span className="text-destructive">
                                                                        {resolveLanguageKey(
                                                                            "pleaseSetReservationToUnitCurrencyExchangeRate",
                                                                        )}
                                                                    </span>
                                                                ) : (
                                                                    <>-{reservationDeduction} {unit?.priceCurrency?.name}</>
                                                                )}
                                                            </p>
                                                        }
                                                    </HiddenElement>
                                                </div>
                                            }
                                            <div className="flex justify-between gap-4">
                                                <p>
                                                    {resolveLanguageKey("form.discountApplied")} ({Number(localDiscount || 0)}%)
                                                </p>
                                                <p className="font-semibold text-destructive">
                                                    -
                                                    {((Number(localDiscount || 0) / 100) * (unit.price || 0)).toLocaleString()}{" "}
                                                    {unit?.priceCurrency?.name}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            }
                        </>
                    }
                </CardContent>
                <CardFooter>
                    {
                        loadingCurrency ?
                        <Loader />
                        :
                        <>
                            {
                                currencyError || (saleCurrency && !currency) ?
                                <div className="w-full">
                                    <ErrorView
                                        title={resolveLanguageKey("errorTitleCurrency")}
                                        description={resolveLanguageKey("errorDescriptionCurrency")}
                                        tooltipDescription={resolveLanguageKey("errorTooltipCurrency")}
                                        onClick={() => {
                                            setForceReloadCurrency(forceReloadCurrency + 1);
                                        }}
                                    />
                                </div>
                                :
                                <>
                                    {
                                        unit?.reservation && !reservation?.paid ?
                                        <Alert variant="destructive" className="w-full">
                                            <AlertCircleIcon />
                                            <AlertTitle>{resolveLanguageKey("cannotProceed")}</AlertTitle>
                                            <AlertDescription>{resolveLanguageKey("linkedReservationBlocksSale")}</AlertDescription>
                                        </Alert>
                                        :
                                        <div className="w-full">
                                            <div className="flex justify-between w-full">
                                                <p className="text-lg font-semibold tracking-wide uppercase">
                                                    {resolveLanguageKey("form.finalPriceLabel")}:
                                                </p>
                                                <p className="font-semibold">
                                                    {
                                                        !!saleCurrency && !!currency && saleCurrency !== unit?.priceCurrency?._id?.toString() && !saleExchangeRate ?
                                                        <span className="text-destructive">
                                                            {resolveLanguageKey("pleaseSetUnitToSaleCurrencyExchangeRate")}
                                                        </span>
                                                        : finalPrice < 0 ?
                                                        <p className="text-sm text-destructive font-sans">
                                                            {resolveLanguageKey("form.finalPriceNegativeError")}
                                                        </p>
                                                        :
                                                        <>
                                                            {(finalPrice || 0).toLocaleString()}{" "}
                                                            {currency?.name || currency?.symbol || unit?.priceCurrency?.name || unit?.priceCurrency?.symbol}
                                                        </>
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    }
                                </>
                            }
                        </>
                    }
                </CardFooter>
            </Card>

        </div>
    );
}
