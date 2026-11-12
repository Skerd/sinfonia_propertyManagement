import {compose} from "redux";
import {useEffect, useMemo, useRef, useState} from "react";
import type {UseFormReturn} from "react-hook-form";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useNavigate} from "react-router-dom";
import {createReservationFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/createReservation.form.validator.ts";
import {CreateReservationFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.schema-def.ts";
import {useSelector} from "react-redux";
import type {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import {IconSquarePlus2} from "@tabler/icons-react";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import FormViewRenderer from "@coreModule/components/viewEngine/FormViewRenderer.tsx";
import {reservationsListPath} from "@propertyManagementModule/clients/panel/private/reservations/center/sheetView/reservationSheetView.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {companyToday} from "@coreModule/helpers/general/dateTime.ts";
import type {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";

const UNIT_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/unit/single"};

/** The deposit starts in the picked unit's currency (UX-06); a currency already picked stays. Renders nothing. */
function DepositCurrencyFromUnit({form}: {form: UseFormReturn<CreateReservationFormType>}) {
    const unitId = form.watch("unit");
    const [unitCount, setUnitCount] = useState(0);
    useEffect(() => {
        if (unitId) setUnitCount((count) => count + 1);
    }, [unitId]);
    useHttpRequest<Unit>(UNIT_REQUEST, {_id: unitId}, unitCount, true, {
        success: (unit) => {
            if (unit.priceCurrency?._id && !form.getValues("depositCurrency")) form.setValue("depositCurrency", unit.priceCurrency._id);
        },
    });
    return null;
}

function localFilesFromField(value: unknown): File[] {
    if (!Array.isArray(value)) return [];
    return value.filter((x): x is File => x instanceof File);
}

type CreateReservationProps = WithLanguageType & WithAxiosType<any, CreateReservationFormType> & {
    unitId?: string;
    unitName?: string;
};

function CreateReservation({
    resolveLanguageKey,
    loading,
    languageCode,
    innerRef,
    onFormDataChange,
    unitId: propUnitId,
    unitName: propUnitName,
}: CreateReservationProps) {
    const navigate = useNavigate();
    const {create} = useAccess("reservations");
    const unitId = propUnitId;
    const company = useSelector((state: RootState) => state.authentication?.user?.company);
    const currentUserId = useSelector((state: RootState) => state.authentication.user.id);
    const lastSubmittedUnitId = useRef("");

    const viewConfig = useViewConfig("reservations", "form:create");
    const timeZone = useCompanyTimeZone();
    const formSchema = createReservationFormSchema(languageCode, resolveLanguageKey("form"), undefined, undefined, {timeZone});

    const formExtras = useMemo(
        () => ({
            prefilledUnitId: !!unitId,
        }),
        [unitId],
    );

    function onSubmit(data: CreateReservationFormType) {
        const finalUnitId = (unitId || data.unit)?.trim();
        if (!finalUnitId) {
            return;
        }
        lastSubmittedUnitId.current = finalUnitId;

        const formData = new FormData();
        formData.append("unit", finalUnitId);
        formData.append("reservedBy", data.reservedBy);
        formData.append("reservedByCompany", company._id);
        formData.append("client", data.client);
        formData.append("reservationDate", data.reservationDate);
        formData.append("expirationDate", data.expirationDate);
        if (data.reservationNotes != null) formData.append("reservationNotes", data.reservationNotes);
        if (data.depositAmount != null) formData.append("depositAmount", String(data.depositAmount));
        if (data.depositCurrency) formData.append("depositCurrency", data.depositCurrency);
        if (data.source) formData.append("source", data.source);
        if (data.referralCode) formData.append("referralCode", data.referralCode);
        if (data.paymentMethod) formData.append("paymentMethod", data.paymentMethod);

        localFilesFromField(data.reservationContract).forEach((file) => {
            formData.append("reservationContract", file);
        });
        localFilesFromField(data.additionalDocuments).forEach((file) => {
            formData.append("additionalDocuments", file);
        });

        onFormDataChange(formData);
    }

    if (!create) {
        return <HiddenElement />;
    }

    if (!viewConfig) return null;

    if (!company?._id) {
        return <HiddenElement />;
    }

    return (
        <FormViewRenderer<CreateReservationFormType>
            config={viewConfig}
            resolveLanguageKey={resolveLanguageKey}
            formSchema={formSchema}
            defaultValues={{
                unit: unitId ?? "",
                reservedByCompany: company._id,
                // Reserved by whoever records it, on the company's today (UX-06, GLB-09).
                reservedBy: currentUserId,
                reservationDate: companyToday(timeZone),
            }}
            loading={loading}
            innerRef={innerRef}
            onSubmit={onSubmit}
            onCancel={() => navigate(reservationsListPath(propUnitId, propUnitName))}
            onSuccess={() => {
                const id = unitId || lastSubmittedUnitId.current || undefined;
                navigate(reservationsListPath(id, propUnitName));
            }}
            formExtras={formExtras}
            extraTitles={propUnitName ? [propUnitName] : []}
            submitIcon={<IconSquarePlus2 className="h-4 w-4" />}
            renderChildren={(form) => <DepositCurrencyFromUnit form={form} />}
        />
    );
}
export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/reservations/createReservation.tsx"),
    withAxios(
        {
            url: "/api/realEstate/unit/reservation",
            method: "PUT",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "reservations"),
)(CreateReservation);

