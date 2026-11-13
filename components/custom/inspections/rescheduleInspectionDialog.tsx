import {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import ConfirmDialog from "@coreModule/components/custom/confirmDialog.tsx";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {companyToday} from "@coreModule/helpers/general/dateTime.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import type {Inspection} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/inspection.dto.ts";
import type {RescheduleInspectionFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/inspection/rescheduleInspection.form.validator.ts";

type RescheduleInspectionDialogProps = WithLanguageType & WithAxiosType<Inspection, RescheduleInspectionFormType> & {
    open: boolean;
    onClose: () => void;
    inspection: Inspection;
    onSuccess?: (updatedInspection?: Inspection) => void;
};

/** The inspection's new day, a calendar day in the company's zone (GLB-09); opens on the current one (UX-08). */
function RescheduleInspectionDialog({
    inspection,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: RescheduleInspectionDialogProps) {
    const [inspectionDate, setInspectionDate] = useState(inspection.inspectionDate);
    const today = companyToday(useCompanyTimeZone());

    useImperativeHandle(innerRef, () => ({
        success: (data?: Inspection) => {
            onSuccess?.(data);
            onClose();
        },
    }));

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={(next: boolean) => !loading && !next && onClose()}
            title={resolveLanguageKey("confirmTitle")}
            desc={resolveLanguageKey("confirmDescription")}
            confirmText={resolveLanguageKey("confirm")}
            cancelBtnText={resolveLanguageKey("cancel")}
            isLoading={loading}
            disabled={!inspectionDate || inspectionDate === inspection.inspectionDate}
            handleConfirm={() => onFilterChange({_id: inspection._id, inspectionDate})}
        >
            <div className="flex flex-col gap-2">
                <Label htmlFor="inspection-reschedule-date">{resolveLanguageKey("dateLabel")}</Label>
                <DateInput
                    id="inspection-reschedule-date"
                    valueFormat="YYYY-MM-DD"
                    value={inspectionDate}
                    onChange={setInspectionDate}
                    minDate={today}
                    disabled={loading}
                    clearable={false}
                />
            </div>
        </ConfirmDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/inspections/rescheduleInspectionDialog.tsx"),
    withAxios<Inspection, RescheduleInspectionFormType>({url: "/api/realEstate/unit/inspection/reschedule", method: "POST", data: {}}, true),
    withDebug(true, true, "inspections"),
)(RescheduleInspectionDialog);
