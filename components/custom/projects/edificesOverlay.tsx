import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@coreModule/components/ui/dialog.tsx";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import EdificeCard from "@propertyManagementModule/clients/panel/private/edifices/center/cardView/edificeCard.tsx";
import {Project} from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.dto.ts";
import {Edifice} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts";
import {openActionMenuFromContextMenu} from "@coreModule/components/custom/actions/menu/openActionMenuFromContextMenu.ts";

type EdificesOverlayProps = WithLanguageType & {
    project: Project;
    openEdificesOverlay?: boolean;
    onClose: () => void;
};

function EdificesOverlay({
    project,
    openEdificesOverlay,
    onClose,
    resolveLanguageKey,
}: EdificesOverlayProps) {
    const {read: readProjects} = useAccess("projects");
    const {read: readEdifices} = useAccess("edifices");
    const [open, setOpen] = useState<boolean>(!!openEdificesOverlay);
    const [selectedEdificeId, setSelectedEdificeId] = useState<string>("");

    const projectMainImageId = project.mainImage?._id;
    const edificesCoordinates = project.edificesCoordinates;

    if (!readProjects?.mainImage || !readEdifices) {
        return <HiddenElement />;
    }

    if (!projectMainImageId) {
        return (
            <p className="text-sm text-muted-foreground">
                {resolveLanguageKey("noMainImage")}
            </p>
        );
    }

    return (
        <>
            <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) { onClose(); } }}>
                <DialogContent className="flex-full xl:w-[50vw] xl:min-w-[50vw] w-screen min-w-screen max-h-screen xl:max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader>
                        <DialogTitle>
                            {resolveLanguageKey("title")}{project.name ? ` - ${project.name}` : ""}
                        </DialogTitle>
                        <DialogDescription>
                            {resolveLanguageKey("description")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
                            <div className="xl:col-span-4 h-[75vh] max-h-[75vh] ">
                                <PolygonSelector
                                    fillHeight={true}
                                    dashboard={true}
                                    imageUrl={`/api/auxiliary/media/${projectMainImageId}`}
                                    phantomPoints={edificesCoordinates || []}
                                    phantomHoverContent={(item: { name?: string }) => (
                                        <div className="p-1 w-fit text-sm">
                                            <p>{item.name}</p>
                                        </div>
                                    )}
                                    onFloorClick={(item: { _id: string }) => { setSelectedEdificeId(item._id); }}
                                    initialPoints={[]}
                                    onPointsChange={() => {}}
                                    disabled={true}
                                />
                            </div>
                            <div className="xl:col-span-2">
                                {
                                    !selectedEdificeId
                                        ? (
                                            <p className="font-semibold text-center">
                                                {resolveLanguageKey("noEdificeSelected")}
                                            </p>
                                        )
                                        : (
                                            <div onContextMenu={openActionMenuFromContextMenu}>
                                                <EdificeCard
                                                    fetchId={selectedEdificeId}
                                                    edifice={{} as Edifice}
                                                    projectId={project._id}
                                                    projectName={project.name}
                                                />
                                            </div>
                                        )
                                }
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/projects/edificesOverlay.tsx")
)(EdificesOverlay);
