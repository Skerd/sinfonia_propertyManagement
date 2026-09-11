import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import {ClipboardCheck, LoaderCircle} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@coreModule/components/ui/alert-dialog.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Switch} from "@coreModule/components/ui/switch.tsx";
import type {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import type {SaleHandoverChecklistItem} from "armonia/src/modules/propertyManagement/api/realEstate/private/handoverPackage/handoverPackage.dto.ts";

type UpdateHandoverDialogProps = WithLanguageType & WithAxiosType<Sale, {_id: string; items: {_id: string; completed: boolean}[]}> & {
    open: boolean;
    onClose: () => void;
    sale: Sale;
    onSuccess?: (updated?: Sale) => void;
};

function importanceVariant(importance?: string) {
    if (importance === "high") return "destructive" as const;
    if (importance === "medium") return "default" as const;
    return "secondary" as const;
}

function UpdateHandoverDialog({
    sale,
    open,
    onClose,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    loading,
}: UpdateHandoverDialogProps) {
    const [ticks, setTicks] = useState<boolean[]>([]);

    useEffect(() => {
        if (open) {
            setTicks((sale.handoverChecklistItems ?? []).map((item) => !!item.completed));
        }
    }, [open, sale]);

    useImperativeHandle(innerRef, () => ({
        success: (data: Sale) => {
            onSuccess?.(data);
            onClose();
        },
    }));

    const items = sale.handoverChecklistItems ?? [];

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent
                className="flex max-h-[85vh] w-[calc(100%-2rem)] flex-col overflow-hidden data-[size=default]:max-w-xl data-[size=default]:sm:max-w-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <AlertDialogHeader className="shrink-0">
                    <AlertDialogTitle>{resolveLanguageKey("title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {resolveLanguageKey("description")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex min-h-0 flex-1 flex-col gap-y-3 overflow-y-auto py-2">
                    {items.map((item: SaleHandoverChecklistItem, index) => (
                        <div
                            key={item._id ?? `${item.name}-${index}`}
                            className="flex items-start justify-between gap-4 rounded-lg border border-border/60 p-3"
                        >
                            <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-medium">{item.name}</p>
                                    <Badge variant="outline">
                                        {String(resolveLanguageKey(`sourceScopes.${item.sourceScope}`) || item.sourceScope)}
                                    </Badge>
                                    {item.importance ? (
                                        <Badge variant={importanceVariant(item.importance)}>
                                            {String(resolveLanguageKey(`importance.${item.importance}`) || item.importance)}
                                        </Badge>
                                    ) : null}
                                </div>
                                {item.description ? (
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                ) : null}
                                {item.instructions ? (
                                    <p className="text-xs text-muted-foreground">{item.instructions}</p>
                                ) : null}
                            </div>
                            <Switch
                                checked={ticks[index] ?? false}
                                disabled={loading || !!item.retained}
                                onCheckedChange={(checked) => {
                                    setTicks((prev) => prev.map((value, i) => (i === index ? checked : value)));
                                }}
                            />
                        </div>
                    ))}
                </div>
                <AlertDialogFooter className="shrink-0">
                    <AlertDialogCancel disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onFilterChange({
                                _id: sale._id,
                                items: items.flatMap((item, index) =>
                                    item._id
                                        ? [{_id: item._id, completed: ticks[index] ?? !!item.completed}]
                                        : [],
                                ),
                            });
                        }}
                        disabled={loading || items.length === 0}
                    >
                        {loading ? <LoaderCircle className="animate-spin" /> : <ClipboardCheck />}
                        <p>{resolveLanguageKey("confirm")}</p>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/sales/updateHandoverDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/handoverPackage/updateHandoverItems",
            data: {},
        },
        true,
    ),
    withDebug(true, true, ["sales", "handoverpackages"]),
)(UpdateHandoverDialog);
