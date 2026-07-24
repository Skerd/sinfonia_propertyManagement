import {type ReactNode, useEffect, useState} from "react";
import {LoaderCircle} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";

export type StatusChangeValues = {notes?: string; expiresAt?: string};

/**
 * Presentational workflow-transition dialog shared by projectDocument and permit
 * actions. It owns only local form state (notes / expiration date); the axios
 * transport and language resolution live in the thin per-action wrappers so that
 * each action can bind its own endpoint via withAxios.
 */
export type StatusChangeDialogProps = {
    open: boolean;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (values: StatusChangeValues) => void;
    title: string;
    description?: string;
    submitLabel: string;
    cancelLabel: string;
    submitIcon?: ReactNode;
    showNotes?: boolean;
    notesLabel?: string;
    notesPlaceholder?: string;
    showDate?: boolean;
    dateLabel?: string;
    dateRequired?: boolean;
    initialDate?: string;
};

export default function StatusChangeDialog({
    open,
    loading = false,
    onClose,
    onSubmit,
    title,
    description,
    submitLabel,
    cancelLabel,
    submitIcon,
    showNotes = false,
    notesLabel,
    notesPlaceholder,
    showDate = false,
    dateLabel,
    dateRequired = false,
    initialDate,
}: StatusChangeDialogProps) {
    const [notes, setNotes] = useState("");
    const [expiresAt, setExpiresAt] = useState(initialDate ?? "");

    useEffect(() => {
        if (open) {
            setNotes("");
            setExpiresAt(initialDate ?? "");
        }
    }, [open, initialDate]);

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const dateMissing = showDate && dateRequired && !expiresAt;

    const handleSubmit = () => {
        if (loading || dateMissing) return;
        onSubmit({
            notes: showNotes && notes.trim() ? notes.trim() : undefined,
            expiresAt: showDate && expiresAt ? expiresAt : undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description ? <DialogDescription>{description}</DialogDescription> : null}
                </DialogHeader>
                <div className="space-y-4 py-2">
                    {showDate && (
                        <div className="space-y-2">
                            <Label>{dateLabel}</Label>
                            <Input
                                type="date"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    )}
                    {showNotes && (
                        <div className="space-y-2">
                            <Label>{notesLabel}</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={notesPlaceholder}
                                disabled={loading}
                                rows={4}
                                className="resize-none max-h-80"
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
                        {cancelLabel}
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={loading || dateMissing}>
                        {loading ? <LoaderCircle className="animate-spin h-4 w-4" /> : submitIcon}
                        {submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
