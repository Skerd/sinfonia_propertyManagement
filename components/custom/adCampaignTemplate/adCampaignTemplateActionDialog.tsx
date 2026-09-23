import {useImperativeHandle} from "react";
import {compose} from "redux";
import {LoaderCircle} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import type {AdCampaignTemplate} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaignTemplate/adCampaignTemplate.dto.ts";

/** The two sides of the `active` flag, each its own server action. */
export type AdCampaignTemplateActionMethod = "activate" | "deactivate";

type AdCampaignTemplateActionDialogOwnProps = {
    open: boolean;
    onClose: () => void;
    template: AdCampaignTemplate;
    methodName: AdCampaignTemplateActionMethod;
    onSuccess?: (updated?: AdCampaignTemplate) => void;
};

type AdCampaignTemplateActionDialogProps = WithLanguageType &
    WithAxiosType<AdCampaignTemplate, {_id: string}> &
    AdCampaignTemplateActionDialogOwnProps;

/**
 * Confirm dialog for retiring or reinstating a template.
 *
 * Deactivating does not touch campaigns already sending — the sender refuses an
 * inactive template per recipient rather than mailing something that was pulled
 * — which is exactly why it deserves a confirmation instead of a form switch.
 */
function AdCampaignTemplateActionDialog({
    template,
    open,
    onClose,
    methodName,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: AdCampaignTemplateActionDialogProps) {
    useImperativeHandle(innerRef, () => ({
        success: (data?: AdCampaignTemplate) => {
            onClose();
            onSuccess?.(data);
        },
    }));

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>
                        {template.name
                            ? `${resolveLanguageKey(`titles.${methodName}`)} — ${template.name}`
                            : resolveLanguageKey(`titles.${methodName}`)}
                    </DialogTitle>
                    <DialogDescription>{resolveLanguageKey(`descriptions.${methodName}`)}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button
                        type="button"
                        variant={methodName === "deactivate" ? "destructive" : "default"}
                        onClick={() => onFilterChange({_id: template._id})}
                        disabled={loading}
                    >
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : null}
                        {resolveLanguageKey(`submit.${methodName}`)}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const LANGUAGE_PATH = "src/modules/propertyManagement/components/custom/adCampaignTemplate/adCampaignTemplateActionDialog.tsx";

function composeActionDialog(methodName: AdCampaignTemplateActionMethod) {
    function DialogWithMethod(props: Omit<AdCampaignTemplateActionDialogProps, "methodName">) {
        return <AdCampaignTemplateActionDialog {...props} methodName={methodName} />;
    }

    return compose(
        withLanguage(LANGUAGE_PATH),
        withAxios(
            {
                method: "POST",
                url: `/api/realEstate/adCampaignTemplate/${methodName}`,
                data: {},
            },
            true,
        ),
        withDebug(true, true, "adcampaigntemplates"),
    )(DialogWithMethod);
}

export const ActivateAdCampaignTemplateDialog = composeActionDialog("activate");
export const DeactivateAdCampaignTemplateDialog = composeActionDialog("deactivate");
