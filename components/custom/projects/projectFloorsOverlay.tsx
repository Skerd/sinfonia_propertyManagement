import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@coreModule/components/ui/dialog.tsx";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {useMemo, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import FloorCard from "@propertyManagementModule/clients/panel/private/floors/center/cardView/floorCard.tsx";
import {Floor} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.dto.ts";
import {Project} from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.dto.ts";
import {openActionMenuFromContextMenu} from "@coreModule/components/custom/actions/menu/openActionMenuFromContextMenu.ts";

type ProjectFloorsOverlayProps = WithLanguageType & {
    project: Project;
    openFloorsOverlay?: boolean;
    onClose: () => void;
};

function ProjectFloorsOverlay({
    project,
    openFloorsOverlay,
    onClose,
    resolveLanguageKey,
}: ProjectFloorsOverlayProps) {
    const {read: readProjects} = useAccess("projects");
    const {read: readFloors} = useAccess("floors");
    const [open, setOpen] = useState<boolean>(!!openFloorsOverlay);
    const [selectedFloorId, setSelectedFloorId] = useState<string>("");

    const projectMainImageId = project.mainImage?._id;

    // Flatten all floors from all edifices into one array for the PolygonSelector
    const allFloorsCoordinates = useMemo(() => {
        if (!project.edificesCoordinates) return [];
        const result: { _id: string; name: string; polygonCoordinates: {x: number; y: number}[] }[] = [];
        for (const edifice of project.edificesCoordinates) {
            if (edifice.floorsCoordinates) {
                result.push(...edifice.floorsCoordinates);
            }
        }
        return result;
    }, [project.edificesCoordinates]);

    if (!readProjects?.mainImage || !readFloors) {
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
                            <div className="xl:col-span-4 h-[75vh] max-h-[75vh]">
                                <PolygonSelector
                                    fillHeight={true}
                                    dashboard={true}
                                    imageUrl={`/api/auxiliary/media/${projectMainImageId}`}
                                    phantomPoints={allFloorsCoordinates}
                                    phantomHoverContent={(item: any) => (
                                        <div className="p-1 w-fit text-sm">
                                            <p>{item.name}</p>
                                        </div>
                                    )}
                                    onFloorClick={(item: any) => { setSelectedFloorId(item._id); }}
                                    initialPoints={[]}
                                    onPointsChange={() => {}}
                                    disabled={true}
                                />
                            </div>
                            <div className="xl:col-span-2">
                                {
                                    !selectedFloorId
                                        ? (
                                            <p className="font-semibold text-center">
                                                {resolveLanguageKey("noFloorSelected")}
                                            </p>
                                        )
                                        : (
                                            <div onContextMenu={openActionMenuFromContextMenu}>
                                    <FloorCard fetchId={selectedFloorId} floor={{} as Floor} />
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
    withLanguage("src/modules/propertyManagement/components/custom/projects/projectFloorsOverlay.tsx")
)(ProjectFloorsOverlay);
