import {compose} from "redux";
import {IconX} from "@tabler/icons-react";
import {Dialog, DialogFrame} from "@coreModule/components/ui/dialog.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import PdfDialogViewer from "@coreModule/components/custom/pdf/PdfDialogViewer.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";

type PdfLightboxProps = WithLanguageType & {
    src: string;
    onClose: () => void;
};

function PdfLightbox({src, onClose, resolveLanguageKey}: PdfLightboxProps) {
    // Radix: focus trap and return, Escape, scroll lock (D23). The viewer is the dialog, so its close button stays
    // reachable; a click on the dark area around the document closes it.
    return (
        <Dialog open onOpenChange={(next) => !next && onClose()}>
            <DialogFrame
                title={resolveLanguageKey("title")}
                overlayClassName="fixed inset-0 z-[300]"
                className="fixed inset-0 z-[300] flex flex-col bg-black/92"
                onClick={(event) => {
                    if (event.target === event.currentTarget) onClose();
                }}
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-[5px] text-white transition hover:bg-white/10 hover:text-white"
                    aria-label={resolveLanguageKey("close")}
                >
                    <IconX className="size-6" strokeWidth={1.5} />
                </Button>
                <div className="relative flex min-h-0 flex-1 items-stretch justify-center px-4 py-4 sm:px-10 sm:py-6">
                    <PdfDialogViewer src={src} className="h-full min-h-0 w-full" />
                </div>
            </DialogFrame>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/shared/pdfLightbox.tsx"),
)(PdfLightbox);
