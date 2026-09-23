import {useEffect, useImperativeHandle, useState} from "react";
import {compose} from "redux";
import {LoaderCircle, TriangleAlert} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import type {AdCampaign} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.dto.ts";

/** Campaign actions that take a plain confirm. */
export type AdCampaignActionMethod = "sendNow" | "pause" | "resume" | "cancel";

type AudienceCounts = {total: number; pending: number; suppressed: number};

type AdCampaignActionDialogOwnProps = {
    open: boolean;
    onClose: () => void;
    campaign: AdCampaign;
    methodName: AdCampaignActionMethod;
    onSuccess?: (updated?: AdCampaign) => void;
};

type AdCampaignActionDialogProps = WithLanguageType &
    WithAxiosType<AdCampaign, {_id: string}> &
    AdCampaignActionDialogOwnProps;

/**
 * Confirm dialog for a campaign action.
 *
 * `sendNow` additionally resolves the audience first and shows the real
 * numbers. Sending is the one irreversible button in this module — thousands
 * of client emails, no recall — so "are you sure?" without a count is not a
 * confirmation, it is a formality. `previewAudience` writes no state beyond
 * the recipient rows the send would build anyway.
 */
function AdCampaignActionDialog({
    campaign,
    open,
    onClose,
    methodName,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: AdCampaignActionDialogProps) {
    const [audience, setAudience] = useState<AudienceCounts | null>(null);
    const [audienceError, setAudienceError] = useState(false);
    const [resolving, setResolving] = useState(false);

    useImperativeHandle(innerRef, () => ({
        success: (data?: AdCampaign) => {
            onClose();
            onSuccess?.(data);
        },
    }));

    useEffect(() => {
        if (!open || methodName !== "sendNow" || !campaign?._id) return;
        let cancelled = false;
        setResolving(true);
        setAudienceError(false);
        apiClient
            .post<AudienceCounts>("/api/realEstate/adCampaign/previewAudience", {_id: campaign._id})
            .then(({data}) => { if (!cancelled) setAudience(data); })
            .catch(() => { if (!cancelled) setAudienceError(true); })
            .finally(() => { if (!cancelled) setResolving(false); });
        return () => { cancelled = true; };
    }, [open, methodName, campaign?._id]);

    useEffect(() => {
        if (!open) {
            setAudience(null);
            setAudienceError(false);
        }
    }, [open]);

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const isSend = methodName === "sendNow";
    // Nothing to send to is a misconfiguration, not a confirmation — let them
    // go back and fix the audience rather than queue an empty campaign.
    const blocked = isSend && (resolving || audienceError || audience?.pending === 0);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>
                        {campaign.title
                            ? `${resolveLanguageKey(`titles.${methodName}`)} — ${campaign.title}`
                            : resolveLanguageKey(`titles.${methodName}`)}
                    </DialogTitle>
                    <DialogDescription>{resolveLanguageKey(`descriptions.${methodName}`)}</DialogDescription>
                </DialogHeader>

                {isSend ? (
                    <div className="flex flex-col gap-2 rounded-md border p-3 text-sm">
                        {resolving ? (
                            <span className="flex items-center gap-2 text-muted-foreground">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                {resolveLanguageKey("audience.resolving")}
                            </span>
                        ) : audienceError ? (
                            <span className="flex items-center gap-2 text-destructive">
                                <TriangleAlert className="h-4 w-4" />
                                {resolveLanguageKey("audience.failed")}
                            </span>
                        ) : audience ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{resolveLanguageKey("audience.willReceive")}</span>
                                    <span className="font-medium tabular-nums">{audience.pending}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{resolveLanguageKey("audience.suppressed")}</span>
                                    <span className="tabular-nums">{audience.suppressed}</span>
                                </div>
                                <div className="flex items-center justify-between border-t pt-2">
                                    <span className="text-muted-foreground">{resolveLanguageKey("audience.total")}</span>
                                    <span className="tabular-nums">{audience.total}</span>
                                </div>
                                {audience.pending === 0 ? (
                                    <p className="text-xs text-destructive">{resolveLanguageKey("audience.empty")}</p>
                                ) : null}
                            </>
                        ) : null}
                    </div>
                ) : null}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button
                        type="button"
                        variant={methodName === "cancel" ? "destructive" : "default"}
                        onClick={() => onFilterChange({_id: campaign._id})}
                        disabled={loading || blocked}
                    >
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : null}
                        {resolveLanguageKey(`submit.${methodName}`)}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const LANGUAGE_PATH = "src/modules/propertyManagement/components/custom/adCampaign/adCampaignActionDialog.tsx";

function composeActionDialog(methodName: AdCampaignActionMethod) {
    function DialogWithMethod(props: Omit<AdCampaignActionDialogProps, "methodName">) {
        return <AdCampaignActionDialog {...props} methodName={methodName} />;
    }

    return compose(
        withLanguage(LANGUAGE_PATH),
        withAxios(
            {
                method: "POST",
                url: `/api/realEstate/adCampaign/${methodName}`,
                data: {},
            },
            true,
        ),
        withDebug(true, true, "adcampaigns"),
    )(DialogWithMethod);
}

export const SendAdCampaignNowDialog = composeActionDialog("sendNow");
export const PauseAdCampaignDialog = composeActionDialog("pause");
export const ResumeAdCampaignDialog = composeActionDialog("resume");
export const CancelAdCampaignDialog = composeActionDialog("cancel");
