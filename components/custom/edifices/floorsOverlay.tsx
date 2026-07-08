import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Edifice} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts";
import {Floor} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.dto.ts";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {openActionMenuFromContextMenu} from "@coreModule/components/custom/actions/menu/openActionMenuFromContextMenu.ts";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@coreModule/components/ui/dialog.tsx";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import FloorCard from "@propertyManagementModule/clients/panel/private/floors/center/cardView/floorCard.tsx";

type FloorsOverlayProps = WithLanguageType & {
    projectMainImageId?: string,
    edificeName: string,
    floorsCoordinates: Edifice["floorsCoordinates"],
    openFloorOverlay?: boolean,
    onClose: () => void
}

function FloorsOverlay({
    projectMainImageId,
    edificeName,
    floorsCoordinates,
    openFloorOverlay,
    onClose,
    resolveLanguageKey
}: FloorsOverlayProps){

    const { read } = useAccess("edifices");
    const {read: readFloors} = useAccess("floors");
    const [open, setOpen] = useState<boolean>(!!openFloorOverlay);
    const [selectedFloor, setSelectedFloor] = useState<string>("");

    if( !read?.mainImage || !readFloors ){return <HiddenElement />}

    if( !projectMainImageId ){
        return (
            <p className="text-sm text-muted-foreground">
                {resolveLanguageKey("noMainImage")}
            </p>
        )
    }

    return (
        <>
            <Dialog open={open} onOpenChange={(open) => {setOpen(open); if (!open){onClose();}}}>
                <DialogContent className="flex-full xl:w-[50vw] xl:min-w-[50vw] w-screen min-w-screen max-h-screen xl:max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader>
                        <DialogTitle>
                            {resolveLanguageKey("title")}{edificeName ? ` - ${edificeName}` : ""}
                        </DialogTitle>
                        <DialogDescription>
                            {resolveLanguageKey("description")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
                            <div className="xl:col-span-4 h-[75vh] max-h-[75vh] ">
                                <PolygonSelector
                                    dashboard={true}
                                    fillHeight={true}
                                    imageUrl={`/api/auxiliary/media/${projectMainImageId}`}
                                    phantomPoints={floorsCoordinates || []}
                                    phantomHoverContent={(item: any) => (
                                        <div className="p-1 w-fit text-sm">
                                            <p>{item.name}</p>
                                        </div>
                                    )}
                                    onFloorClick={(floor: any) => {setSelectedFloor(floor._id);}}
                                    initialPoints={[]}
                                    onPointsChange={() => {}}
                                    disabled={true}
                                />
                            </div>
                            <div className="xl:col-span-2">
                                <div>
                                    {
                                        !selectedFloor ?
                                            <p className="font-semibold text-center">
                                                {resolveLanguageKey("noFloorSelected")}
                                            </p>
                                            :
                                            <div onContextMenu={openActionMenuFromContextMenu}>
                                    <FloorCard fetchId={selectedFloor} floor={{} as Floor} />
                                </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/edifices/floorsOverlay.tsx")
)(FloorsOverlay);