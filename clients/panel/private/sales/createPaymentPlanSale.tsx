import { compose } from "redux";
import { useCallback, useMemo, useState, useRef } from "react";
import withAxios, { WithAxiosType } from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import { useNavigate } from "react-router-dom";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import { useAccess } from "@coreModule/helpers/hocs/withAccess.tsx";
import { useViewConfig } from "@coreModule/helpers/hooks/useViewConfig.ts";
import FormViewRenderer from "@coreModule/components/viewEngine/FormViewRenderer.tsx";
import {salesListPath} from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/saleSheetView.tsx";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconSquarePlus2 } from "@tabler/icons-react";
import PaymentPlanSaleReceiptSection from "@propertyManagementModule/components/custom/paymentPlan/paymentPlanSaleReceiptSection.tsx";
import {createPaymentPlanSaleFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/createPaymentPlan.form.validator.ts";
import { CreatePaymentPlanSaleFormType } from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/createPaymentPlan.form.type.ts";

function localFilesFromField(value: unknown): File[] {
    if (!Array.isArray(value)) return [];
    return value.filter((x): x is File => x instanceof File);
}

type CreatePaymentPlanSaleFormValues = Omit<CreatePaymentPlanSaleFormType, "installments"> & {
    buyerCompany?: string;
    installments: Array<Omit<CreatePaymentPlanSaleFormType["installments"][number], "principalAmount" | "interestAmount"> & {
        principalAmount?: number;
        interestAmount?: number;
    }>;
};

function createPaymentPlanSaleResolver(
    schema: ReturnType<typeof createPaymentPlanSaleFormSchema>,
): Resolver<CreatePaymentPlanSaleFormValues> {
    return zodResolver(schema as any) as unknown as Resolver<CreatePaymentPlanSaleFormValues>;
}

type CreatePaymentPlanSaleProps = WithLanguageType & WithAxiosType<unknown, CreatePaymentPlanSaleFormValues> & {
    unitId?: string;
    unitName?: string;
};

function CreatePaymentPlanSale({
    resolveLanguageKey,
    loading,
    languageCode,
    innerRef,
    onFormDataChange,
    unitId,
    unitName: propUnitName,
}: CreatePaymentPlanSaleProps) {

    const navigate = useNavigate();
    const { create } = useAccess("sales");
    const lastSubmittedUnitId = useRef("");

    const [disableSubmit, setDisableSubmit] = useState(false);
    const [exchangeRateVisibility, setExchangeRateVisibility] = useState({showSaleExchangeRate: false, showReservationExchangeRate: false,});
    const setSaleExchangeRateVisibility = useCallback((value: boolean) => {setExchangeRateVisibility((prev) => prev.showSaleExchangeRate === value ? prev : {...prev, showSaleExchangeRate: value});}, []);
    const setReservationExchangeRateVisibility = useCallback((value: boolean) => {setExchangeRateVisibility((prev) => prev.showReservationExchangeRate === value ? prev : {...prev, showReservationExchangeRate: value});}, []);
    const viewConfig = useViewConfig("paymentplans", "form:create");
    const formSchema = useMemo(() => createPaymentPlanSaleFormSchema(languageCode, resolveLanguageKey("form")), [languageCode, resolveLanguageKey],);

    const formExtras = useMemo(() => ({
        prefilledUnitId: !!unitId,
        showSaleExchangeRate: exchangeRateVisibility.showSaleExchangeRate,
        showReservationExchangeRate: exchangeRateVisibility.showReservationExchangeRate,
    }), [unitId, exchangeRateVisibility.showSaleExchangeRate, exchangeRateVisibility.showReservationExchangeRate]);

    const onSubmit = useCallback((data: CreatePaymentPlanSaleFormValues) => {
        const formData = new FormData();
        formData.append("paymentType", "payment_plan");
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
        localFilesFromField(data.additionalDocuments).forEach((file) => formData.append("additionalDocuments", file));

        formData.append("downPayment", String(Number(data.downPayment ?? 0)));
        formData.append("interestRate", String(Number(data.interestRate ?? 0)));
        formData.append("gracePeriodDays", String(Number(data.gracePeriodDays ?? 0)));
        formData.append("lateFeePercentage", String(Number(data.lateFeePercentage ?? 0)));
        formData.append("numberOfInstallments", String(Number(data.numberOfInstallments ?? 0)));
        formData.append("startDate", data.startDate);
        formData.append("endDate", data.endDate);
        formData.append("installments", JSON.stringify(data.installments));
        if (data.paymentPlanNotes) formData.append("paymentPlanNotes", data.paymentPlanNotes);
        if (data.buyerCompany) formData.append("buyerCompany", data.buyerCompany);
        if (typeof data.handoverDate === "string" && data.handoverDate.trim() !== "") {
            formData.append("handoverDate", data.handoverDate);
        }
        if (typeof data.handedOverBy === "string" && data.handedOverBy.trim() !== "") {
            formData.append("handedOverBy", data.handedOverBy);
        }
        if (data.handoverNotes) formData.append("handoverNotes", data.handoverNotes);
        localFilesFromField(data.handoverCertificate).forEach((file) => formData.append("handoverCertificate", file));
        if (typeof data.titleTransferDate === "string" && data.titleTransferDate.trim() !== "") {
            formData.append("titleTransferDate", data.titleTransferDate);
        }
        if (data.deedNumber) formData.append("deedNumber", data.deedNumber);
        if (data.notaryName) formData.append("notaryName", data.notaryName);
        localFilesFromField(data.titleTransferCertificate).forEach((file) => formData.append("titleTransferCertificate", file));

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
        <FormViewRenderer<CreatePaymentPlanSaleFormValues>
            config={viewConfig}
            resolveLanguageKey={resolveLanguageKey}
            formSchema={formSchema as any}
            defaultValues={{
                unit: unitId || "",
                numberOfInstallments: 1,
                startDate: "",
                endDate: "",
                installments: [
                    {
                        installmentNumber: 1,
                        dueDate: "",
                        amount: 0,
                        principalAmount: undefined,
                        interestAmount: undefined
                    },
                ],
                reservationExchangeRate: 1,
                saleExchangeRate: 1
            } as any}
            loading={loading}
            innerRef={innerRef}
            onSubmit={onSubmit}
            onCancel={() => navigate(salesListPath(unitId || lastSubmittedUnitId.current || undefined, propUnitName))}
            onSuccess={() => {
                const id = unitId || lastSubmittedUnitId.current || undefined;
                navigate(salesListPath(id, propUnitName));
            }}
            formExtras={formExtras}
            resolver={createPaymentPlanSaleResolver(formSchema)}
            extraTitles={propUnitName ? [propUnitName] : []}
            submitIcon={<IconSquarePlus2 className="h-4 w-4" />}
            submitDisabled={disableSubmit}
            renderChildren={(form) => (
                <PaymentPlanSaleReceiptSection
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
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/createPaymentPlanSale.tsx"),
    withAxios(
        {
            url: "/api/realEstate/unit/sale",
            method: "put",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "sales"),
)(CreatePaymentPlanSale);
