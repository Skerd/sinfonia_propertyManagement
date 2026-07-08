import {compose} from "redux";
import {useState, useMemo, useCallback, useEffect, useRef} from "react";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useNavigate} from "react-router-dom";
import {createCashSaleFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/createSale.form.validator.ts";
import {CreateCashSaleFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/createSale.form.type.ts";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import FormViewRenderer from "@coreModule/components/viewEngine/FormViewRenderer.tsx";
import {salesListPath} from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/saleSheetView.tsx";
import type {Resolver, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {IconSquarePlus2} from "@tabler/icons-react";
import {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {Card, CardContent, CardFooter, CardHeader} from "@coreModule/components/ui/card.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import ReservationCard from "@propertyManagementModule/clients/panel/private/reservations/center/cardView/reservationCard.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {Alert, AlertDescription, AlertTitle} from "@coreModule/components/ui/alert.tsx";
import {AlertCircleIcon} from "lucide-react";
import {Currency} from "armonia/src/modules/core/api/finance/private/currency/currency.dto.ts";

export type CashSaleReceiptSectionProps = {
    /** Create and edit cash-sale forms share the watched field names (`unit`, rates, discount, `finalPrice`). */
    form: UseFormReturn<any>;
    setDisableSubmit: (disable: boolean) => void;
    setSaleExchangeRateVisibility: (visibility: boolean) => void;
    setReservationExchangeRateVisibility: (visibility: boolean) => void;
    resolveLanguageKey: WithLanguageType["resolveLanguageKey"];
};

/**
 * Live unit + reservation fetch, currency fetch, final price preview, and exchange-rate visibility callbacks.
 * Shared by create and edit cash sale flows (`form` must include `unit` id for the sold / target unit).
 */
export function CashSaleReceiptSection({
    form,
    setDisableSubmit,
    setSaleExchangeRateVisibility,
    setReservationExchangeRateVisibility,
    resolveLanguageKey,
}: CashSaleReceiptSectionProps) {
    const {read: readReservation} = useAccess("reservations");

    const unitId = form.watch("unit") as string | undefined;
    const [unit, setUnit] = useState<Unit | null>(null);
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

    useEffect(() => {
        if (!unitId) {
            return;
        }
        setLoadingUnit(true);
        setUnitError(false);
        apiClient
            .post<Unit>("/api/realEstate/unit/single", {_id: unitId})
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
        if (!saleCurrency) {
            return;
        }
        setLoadingCurrency(true);
        setCurrencyError(false);
        apiClient
            .post<Currency>("/api/finance/currency/single", {_id: saleCurrency})
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
        setDisableSubmit(
            (!!reservation && (!readReservation.depositAmount || !readReservation.depositCurrency)) ||
            (!!saleCurrency && !currency) ||
            (!!saleCurrency && !!currency && saleCurrency !== unit?.priceCurrency?._id?.toString() && !saleExchangeRate) ||
            (!!unit?.reservation && !reservation?.paid) ||
            (!!unit?.reservation && reservation?.depositCurrency?._id?.toString() !== unit?.priceCurrency?._id?.toString() && !reservationExchangeRate) ||
            finalPrice < 0
        );
    }, [readReservation, unitId, reservation, saleCurrency, currency, unit, saleExchangeRate, reservationExchangeRate, setDisableSubmit, finalPrice]);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 my-4 gap-4" style={{border: "0px solid red"}}>
            <Card className="md:col-start-2 gap-4">
                <CardHeader className="py-0">
                    <p className="text-sm font-semibold tracking-wide uppercase">
                        {resolveLanguageKey("pricingReceiptTitle")}: {getUnitName(unit)}
                    </p>
                </CardHeader>
                <CardContent className="border-t px-2 w-full pt-4">
                    {finalPrice}
                    {loadingUnit ? (
                        <Loader />
                    ) : (
                        <>
                            {unitError || !unit ? (
                                <ErrorView
                                    title={resolveLanguageKey("errorTitle")}
                                    description={resolveLanguageKey("errorDescription")}
                                    tooltipDescription={resolveLanguageKey("errorTooltip")}
                                    onClick={() => {
                                        setForceReload(forceReload + 1);
                                    }}
                                />
                            ) : (
                                <div className="text space-y-2 font-semibold" style={{border: "0px solid red"}}>
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
                                                <p className="font-semibold text-green-600">
                                                    {unit?.price?.toLocaleString()} {unit?.priceCurrency?.name}
                                                </p>
                                            </div>
                                            {!!reservation && (
                                                <div className="flex justify-between">
                                                    <p className="tracking-wide">
                                                        {resolveLanguageKey("form.reservationDeductionLabel")}:
                                                    </p>
                                                    <HiddenElement>
                                                        {readReservation.depositAmount && (
                                                            <p className="font-semibold text-red-500">
                                                                {unit?.reservation &&
                                                                reservation.depositCurrency?._id?.toString() !==
                                                                unit.priceCurrency?._id?.toString() &&
                                                                !reservationExchangeRate ? (
                                                                    <span className="text-red-500">
                                                                        {resolveLanguageKey("pleaseSetReservationToUnitCurrencyExchangeRate")}
                                                                    </span>
                                                                ) : (
                                                                    <>
                                                                        -{reservationDeduction} {unit?.priceCurrency?.name}
                                                                    </>
                                                                )}
                                                            </p>
                                                        )}
                                                    </HiddenElement>
                                                </div>
                                            )}
                                            <div className="flex justify-between gap-4">
                                                <p className="">
                                                    {resolveLanguageKey("form.discountApplied")} ({Number(localDiscount || 0)}%)
                                                </p>
                                                <p className="font-semibold text-red-500">
                                                    -
                                                    {((Number(localDiscount || 0) / 100) * (unit.price || 0)).toLocaleString()}{" "}
                                                    {unit?.priceCurrency?.name}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
                <CardFooter style={{border: "0px solid red"}}>
                    {loadingCurrency ? (
                        <Loader />
                    ) : (
                        <>
                            {currencyError || (saleCurrency && !currency) ? (
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
                            ) : (
                                <>
                                    {unit?.reservation && !reservation?.paid ? (
                                        <Alert variant="destructive" className="w-full">
                                            <AlertCircleIcon />
                                            <AlertTitle>{resolveLanguageKey("cannotProceed")}</AlertTitle>
                                            <AlertDescription>{resolveLanguageKey("linkedReservationBlocksSale")}</AlertDescription>
                                        </Alert>
                                    ) : (
                                        <div className="w-full">
                                            <div className="flex justify-between w-full">
                                                <p className="text-lg font-semibold tracking-wide uppercase">
                                                    {resolveLanguageKey("form.finalPriceLabel")}:
                                                </p>
                                                <p className="font-semibold">
                                                    {
                                                        !!saleCurrency && !!currency && saleCurrency !== unit?.priceCurrency?._id?.toString() && !saleExchangeRate ?
                                                        <span className="text-red-500">
                                                            {resolveLanguageKey("pleaseSetUnitToSaleCurrencyExchangeRate")}
                                                        </span>
                                                        : finalPrice < 0 ?
                                                        <p className="text-sm text-destructive font-sans">
                                                            {resolveLanguageKey("form.finalPriceNegativeError")}
                                                        </p>
                                                        :
                                                        <>
                                                            {(finalPrice || 0).toLocaleString()}{" "}
                                                            {currency?.name || currency?.symbol}
                                                        </>
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}







function localFilesFromField(value: unknown): File[] {
    if (!Array.isArray(value)) return [];
    return value.filter((x): x is File => x instanceof File);
}

type CreateCashSaleFormValues = z.infer<ReturnType<typeof createCashSaleFormSchema>>;

function createCashSaleResolver(
    schema: ReturnType<typeof createCashSaleFormSchema>,
): Resolver<CreateCashSaleFormValues> {
    return zodResolver(schema) as unknown as Resolver<CreateCashSaleFormValues>;
}

type CreateCashSaleProps = WithLanguageType & WithAxiosType<any, CreateCashSaleFormType> & {
    unitId?: string;
    unitName?: string;
};

function CreateCashSale({
    resolveLanguageKey,
    loading,
    languageCode,
    innerRef,
    onFormDataChange,
    unitId,
    unitName: propUnitName,
}: CreateCashSaleProps) {

    const navigate = useNavigate();
    const {create} = useAccess("sales");
    const lastSubmittedUnitId = useRef("");

    const [disableSubmit, setDisableSubmit] = useState(false);
    const [exchangeRateVisibility, setExchangeRateVisibility] = useState({showSaleExchangeRate: false, showReservationExchangeRate: false,});
    const setSaleExchangeRateVisibility = useCallback((value: boolean) => {setExchangeRateVisibility((prev) => prev.showSaleExchangeRate === value ? prev : {...prev, showSaleExchangeRate: value});}, []);
    const setReservationExchangeRateVisibility = useCallback((value: boolean) => {setExchangeRateVisibility((prev) => prev.showReservationExchangeRate === value ? prev : {...prev, showReservationExchangeRate: value});}, []);
    const viewConfig = useViewConfig("sales", "form:create");
    const formSchema = useMemo(() => createCashSaleFormSchema(languageCode, resolveLanguageKey("form")), [languageCode, resolveLanguageKey]);

    const formExtras = useMemo(() => ({
        prefilledUnitId: !!unitId,
        showSaleExchangeRate: exchangeRateVisibility.showSaleExchangeRate,
        showReservationExchangeRate: exchangeRateVisibility.showReservationExchangeRate,
    }), [unitId, exchangeRateVisibility.showSaleExchangeRate, exchangeRateVisibility.showReservationExchangeRate]);

    const onSubmit = useCallback((data: CreateCashSaleFormValues) => {
        const formData = new FormData();
        formData.append("paymentType", "cash");
        formData.append("unit", data.unit);
        formData.append("soldBy", data.soldBy);
        formData.append("buyer", data.buyer);
        formData.append("saleDate", data.saleDate);
        formData.append("saleCurrency", data.saleCurrency);
        formData.append("localDiscount", String(Number(data.localDiscount || 0)));

        if (data.notes) formData.append("notes", data.notes);
        if (data.transactionReference) formData.append("transactionReference", data.transactionReference);
        if (data.reservationExchangeRate) formData.append("reservationExchangeRate", String(data.reservationExchangeRate));
        if (data.saleExchangeRate) formData.append("saleExchangeRate", String(data.saleExchangeRate));
        const purchaseFiles = localFilesFromField(data.purchaseContract);
        formData.append("purchaseContract", purchaseFiles[0]);
        localFilesFromField(data.additionalDocuments).forEach((file) =>
            formData.append("additionalDocuments", file),
        );
        lastSubmittedUnitId.current = data.unit;
        onFormDataChange(formData);

    }, [unitId, onFormDataChange, resolveLanguageKey]);

    if (!viewConfig) {
        return null;
    }
    if (!create) {
        return <HiddenElement />;
    }

    return (
        <FormViewRenderer<CreateCashSaleFormValues>
            config={viewConfig}
            resolveLanguageKey={resolveLanguageKey}
            formSchema={formSchema}
            //@ts-expect-error
            defaultValues={{
                unit: unitId || "",
                saleExchangeRate: 1,
                reservationExchangeRate: 1
            }}
            loading={loading}
            innerRef={innerRef}
            onSubmit={onSubmit}
            onCancel={() =>
                navigate(salesListPath(unitId || lastSubmittedUnitId.current || undefined, propUnitName))
            }
            onSuccess={() => {
                const id = unitId || lastSubmittedUnitId.current || undefined;
                navigate(salesListPath(id, propUnitName));
            }}
            formExtras={formExtras}
            resolver={createCashSaleResolver(formSchema)}
            extraTitles={propUnitName ? [propUnitName] : []}
            submitIcon={<IconSquarePlus2 className="h-4 w-4" />}
            submitDisabled={disableSubmit}
            renderChildren={(form) => (
                <CashSaleReceiptSection
                    form={form}
                    setDisableSubmit={setDisableSubmit}
                    setSaleExchangeRateVisibility={setSaleExchangeRateVisibility}
                    setReservationExchangeRateVisibility={setReservationExchangeRateVisibility}
                    resolveLanguageKey={resolveLanguageKey}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/createCashSale.tsx"),
    withAxios(
        {
            url: "/api/realEstate/unit/sale",
            method: "put",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(CreateCashSale);
