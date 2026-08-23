import {compose} from "redux";
import {useMemo, useRef} from "react";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useNavigate} from "react-router-dom";
import {createReservationFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/createReservation.form.validator.ts";
import {CreateReservationFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.schema-def.ts";
import {useSelector} from "react-redux";
import type {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {IconSquarePlus2} from "@tabler/icons-react";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import FormViewRenderer from "@coreModule/components/viewEngine/FormViewRenderer.tsx";
import {reservationsListPath} from "@propertyManagementModule/clients/panel/private/reservations/center/sheetView/reservationSheetView.tsx";

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
    const lastSubmittedUnitId = useRef("");

    const viewConfig = useViewConfig("reservations", "form:create");
    const formSchema = createReservationFormSchema(languageCode, resolveLanguageKey("form"));

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
        if (data.expirationDate) formData.append("expirationDate", data.expirationDate);
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
            //@ts-expect-error
            defaultValues={{
                unit: unitId ?? "",
                reservedByCompany: company._id,
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

