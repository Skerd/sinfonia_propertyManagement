import { useEffect, useMemo, useState } from "react";
import {UseFormReturn, useWatch} from "react-hook-form";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import { Unit, Unit as UnitData } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import { ErrorView } from "@coreModule/components/custom/errors/errorView.tsx";
import ReservationCard from "@propertyManagementModule/clients/panel/private/reservations/center/cardView/reservationCard.tsx";
import { Reservation } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import { cn } from "@coreModule/components/lib/utils.ts";
import {IconAlertCircle} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@coreModule/components/ui/alert.tsx";
import { Card, CardContent, CardFooter, CardHeader } from "@coreModule/components/ui/card.tsx";
import type { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Currency} from "armonia/src/modules/core/api/finance/private/currency/currency.dto.ts";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import {roundToCurrency} from "armonia/src/modules/core/helpers/money.ts";
import {allocatePlanInterest, type PlanScheduleErrorCode} from "armonia/src/modules/propertyManagement/helpers/paymentPlanInterest.ts";
import {Table} from "@coreModule/components/ui/table/table.tsx";
import {salePricingPreview} from "@propertyManagementModule/components/custom/sale/salePricingPreview.ts";
import {round2} from "@propertyManagementModule/components/custom/sale/localDiscountField.tsx";

const UNIT_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/unit/single"};
const CURRENCY_REQUEST: HttpRequest = {method: "post", url: "/api/finance/currency/single"};

/** Rounds once to the sale currency's decimals (D35); empty form fields (NaN) count as 0. */
function roundMoney(value: number, decimals?: number): number {
    return Number.isFinite(value) ? roundToCurrency(value, decimals) : 0;
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
    | { ok: false; code: "invalid_input" | Exclude<PlanScheduleErrorCode, "invalid_schedule"> };

function dayUtcMs(isoDate: string): number {
    const parts = isoDate.trim().split("-").map((x) => Number.parseInt(x, 10));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return Number.NaN;
    const [y, m, d] = parts;
    return Date.UTC(y, m - 1, d);
}

/** The server's split (armonia `allocatePlanInterest`), laid back out in the form's row order. */
function computeSimpleAmortization(params: {
    financedPrincipal: number;
    annualRatePercent: number;
    planStartDate: string;
    planEndDate: string;
    rows: Array<{ installmentNumber: number; dueDate: string; amount: number; notes?: string }>;
    decimals?: number;
    interestRatePerInstallment?: number;
    gracePeriodDays?: number;
    lateFeePercentage?: number;
}): AmortizationResult {
    const result = allocatePlanInterest(params);
    if (!result.ok) return { ok: false, code: result.code === "invalid_schedule" ? "invalid_input" : result.code };
    const installmentsInFormOrder: AmortizationRowOutput[] = new Array(params.rows.length);
    for (const { index, ...row } of result.installments) {
        installmentsInFormOrder[index] = {
            ...row,
            interestRate: params.interestRatePerInstallment,
            gracePeriodDays: params.gracePeriodDays,
            lateFeePercentage: params.lateFeePercentage,
        };
    }
    return { ok: true, installments: installmentsInFormOrder, totalContractInterest: result.totalContractInterest, planDays: result.planDays };
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

    const pricing = salePricingPreview({unit, reservation, saleCurrency: currency, localDiscount, saleExchangeRate, reservationExchangeRate});
    const finalPrice = pricing.finalPrice ?? 0;

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
    const decimals = currency?.decimalPlaces;
    const financedAmount = roundMoney(Number(finalPrice ?? 0) - Number(downPayment ?? 0), decimals);
    const isFinancedNegative = financedAmount < 0;

    const installmentsWatch = useWatch({control: form.control, name: "installments"});

    // Loads again when it changes or on retry.
    const [unitCount, setUnitCount] = useState(0);
    useEffect(() => {
        if (unitId) setUnitCount((count) => count + 1);
    }, [unitId, forceReload]);
    useHttpRequest<Unit>(UNIT_REQUEST, {_id: unitId}, unitCount, true, {
        start: () => {
            setLoadingUnit(true);
            setUnitError(false);
        },
        success: (data) => {
            setUnit(data);
            setLoadingUnit(false);
        },
        error: () => {
            setUnitError(true);
            setLoadingUnit(false);
        },
    });

    // Loads again when it changes or on retry.
    const [currencyCount, setCurrencyCount] = useState(0);
    useEffect(() => {
        if (saleCurrency) setCurrencyCount((count) => count + 1);
    }, [saleCurrency, forceReloadCurrency]);
    useHttpRequest<Currency>(CURRENCY_REQUEST, {_id: saleCurrency}, currencyCount, true, {
        start: () => {
            setLoadingCurrency(true);
            setCurrencyError(false);
        },
        success: (data) => {
            setCurrency(data);
            setLoadingCurrency(false);
        },
        error: () => {
            setCurrencyError(true);
            setLoadingCurrency(false);
        },
    });

    // The deposit is converted into the sale currency, so its rate is asked for when those two differ.
    useEffect(() => {
        if (!!reservation && !!saleCurrency) {
            if( reservation.depositCurrency?._id?.toString() !== saleCurrency ){
                setReservationExchangeRateVisibility(true);
                form.setValue("reservationExchangeRate", "");
            }
            else{
                setReservationExchangeRateVisibility(false);
                form.setValue("reservationExchangeRate", 1);
            }
        }
    }, [reservation, saleCurrency, setReservationExchangeRateVisibility]);

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
        if (!s) return;
        const current = String(form.getValues("startDate") || "").trim();
        if (current === s) return;
        form.setValue("startDate", s, { shouldDirty: false, shouldValidate: true });
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
            amount: roundMoney(Number(row.amount) || 0, decimals),
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
            decimals,
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

    }, [financedAmount, isFinancedNegative, interestRate, gracePeriodDays, lateFeePercentage, startDate, endDate, installments, installmentsWatch, decimals]);

    useEffect(() => {
        setDisableSubmit(
            (!!reservation && (!readReservation.depositAmount || !readReservation.depositCurrency)) ||
            (!!saleCurrency && !currency) ||
            (!!unit?.reservation && !reservation?.paid) ||
            pricing.missingSaleExchangeRate ||
            pricing.missingReservationExchangeRate ||
            pricing.negative ||
            isFinancedNegative ||
            // amortization block
            (finalPrice - downPayment) > 0.005 &&
                (!!amortErrorCode ||
                    scheduleRows.length === 0 ||
                    !String(startDate || "").trim() ||
                    !String(endDate || "").trim() ||
                    !Array.isArray(installments) ||
                    installments.length === 0)
        );
    }, [
        readReservation,
        reservation,
        saleCurrency,
        currency,
        unit,
        pricing.missingSaleExchangeRate,
        pricing.missingReservationExchangeRate,
        pricing.negative,
        setDisableSubmit,
        finalPrice,
        isFinancedNegative,
        downPayment,
        startDate,
        endDate,
        amortErrorCode,
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
        const financed = roundMoney(Number(finalPrice ?? 0) - Number(downPayment ?? 0), decimals);
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
            const amount = roundMoney(Number(installments[fi]?.amount) || 0, decimals);
            if (amount > 0) {
                if (!amortErrorCode && scheduleRows[fi]) {
                    const p = Math.max(0, scheduleRows[fi]!.principalAmount ?? 0);
                    bal = Math.max(0, roundMoney(bal - p, decimals));
                } else {
                    bal = Math.max(0, roundMoney(bal - amount, decimals));
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
        decimals,
    ]);

    const getUnitName = (u: Unit | null) => {
        if (!u) {
            return "";
        }

        const values = [];
        if (u?.unitNumber) {
            values.push(u?.unitNumber);
        }
        if (u?.name) {
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
                <CardContent className="flex flex-col border-t px-2 w-full pt-4 gap-y-3">
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
                                    {formatNumber(financedAmount)} {currency?.name || currency?.symbol || unit?.priceCurrency?.name || unit?.priceCurrency?.symbol}
                                </span>
                                :
                                <>
                                    {formatNumber(financedAmount)} {currency?.name || currency?.symbol || unit?.priceCurrency?.name || unit?.priceCurrency?.symbol}
                                </>
                            }
                        </span>
                    </div>
                    {
                        isFinancedNegative &&
                        <Alert variant="destructive">
                            <IconAlertCircle />
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
                                    {formatNumber(amortMeta.totalContractInterest)}{" "}
                                    {currency?.name || currency?.symbol || unit?.priceCurrency?.name || unit?.priceCurrency?.symbol}
                                    <span className="text-muted-foreground font-normal text-xs ml-1">
                                        ({amortMeta.planDays} {resolveLanguageKey("planDaysSuffix")})
                                    </span>
                                </span>
                            </div>
                            <div className="flex justify-between text-sm border-t pt-2">
                                <span className="text-muted-foreground">{resolveLanguageKey("totalObligationLabel")}</span>
                                <span className="font-semibold">
                                    {formatNumber(roundMoney(
                                        roundMoney(Number(finalPrice ?? 0) - Number(downPayment ?? 0), decimals) +
                                            amortMeta.totalContractInterest,
                                        decimals,
                                    ))}{" "}
                                    {currency?.name || currency?.symbol || unit?.priceCurrency?.name || unit?.priceCurrency?.symbol}
                                </span>
                            </div>
                        </>
                    }
                    {
                        amortErrorCode ? (
                            <Alert variant="destructive">
                                <IconAlertCircle />
                                <AlertTitle>{resolveLanguageKey("amortizationErrorTitle")}</AlertTitle>
                                <AlertDescription>
                                    {resolveLanguageKey(`amortizationError.${amortErrorCode}`)}
                                </AlertDescription>
                            </Alert>
                        ) : null
                    }

                    {
                        formScheduleRows.length > 0 ? (
                            <div className="overflow-x-auto rounded-md border">
                                <Table bare className="w-full text-sm">
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
                                            const amount = roundMoney(Number(row.amount) || 0, decimals);
                                            const computed =
                                                !amortErrorCode && scheduleRows[i] !== undefined ? scheduleRows[i] : null;
                                            const principalAmt = computed?.principalAmount;
                                            const interestAmt = computed?.interestAmount;
                                            const openingBal = scheduleOpeningAfter?.openingByForm[i];
                                            const closingBal = scheduleOpeningAfter?.afterByForm[i];
                                            const openingStr =
                                                openingBal != null ? formatNumber(openingBal) : "—";
                                            const closingStr =
                                                closingBal != null ? formatNumber(closingBal) : "—";
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
                                                            ? formatNumber(amount)
                                                            : "—"}
                                                    </td>
                                                    <td className="p-2 text-right text-muted-foreground tabular-nums">
                                                        {openingStr}
                                                    </td>
                                                    <td className="p-2 text-right text-muted-foreground">
                                                        {principalAmt != null
                                                            ? formatNumber(principalAmt)
                                                            : "—"}
                                                    </td>
                                                    <td className="p-2 text-right text-muted-foreground">
                                                        {interestAmt != null
                                                            ? formatNumber(interestAmt)
                                                            : "—"}
                                                    </td>
                                                    <td className="p-2 text-right text-muted-foreground tabular-nums">
                                                        {closingStr}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
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
                                <div className="flex flex-col text gap-y-2 font-semibold">
                                    {unit.reservation?._id ? (
                                        <ReservationCard
                                            reservation={unit.reservation as Reservation}
                                            fetchId={unit.reservation._id}
                                            hideActions={true}
                                            extraSmall={true}
                                            onReady={setReservation}
                                        />
                                    ) : null}

                                    <Card
                                        className={cn(
                                            "group p-0 h-fit relative transition-all duration-300 hover:shadow-md hover:cursor-pointer",
                                        )}
                                    >
                                        <div className="flex flex-col w-full items-stretch p-2 gap-y-2">
                                            <div className="flex justify-between">
                                                <p className="tracking-wide">{resolveLanguageKey("form.unitPriceLabel")}:</p>
                                                <p className="font-semibold text-success">
                                                    {formatNumber(unit?.price)} {unit?.priceCurrency?.name}
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
                                                                {pricing.missingReservationExchangeRate ? (
                                                                    <span className="text-destructive">
                                                                        {resolveLanguageKey(
                                                                            "pleaseSetReservationToUnitCurrencyExchangeRate",
                                                                        )}
                                                                    </span>
                                                                ) : pricing.depositDeduction !== null ? (
                                                                    <>-{formatNumber(pricing.depositDeduction)} {currency?.name}</>
                                                                ) : null}
                                                            </p>
                                                        }
                                                    </HiddenElement>
                                                </div>
                                            }
                                            <div className="flex justify-between gap-4">
                                                <p>
                                                    {resolveLanguageKey("form.discountApplied")} ({round2(Number(localDiscount || 0))}%)
                                                </p>
                                                <p className="font-semibold text-destructive">
                                                    -
                                                    {formatNumber(pricing.discount)}{" "}
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
                                            <IconAlertCircle />
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
                                                        pricing.missingSaleExchangeRate ?
                                                        <span className="text-destructive">
                                                            {resolveLanguageKey("pleaseSetUnitToSaleCurrencyExchangeRate")}
                                                        </span>
                                                        : pricing.negative ?
                                                        <p className="text-sm text-destructive font-sans">
                                                            {resolveLanguageKey("form.finalPriceNegativeError")}
                                                        </p>
                                                        :
                                                        <>
                                                            {formatNumber(finalPrice || 0)}{" "}
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
