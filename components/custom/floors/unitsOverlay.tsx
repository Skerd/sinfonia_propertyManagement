import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Floor} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.dto.ts";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@coreModule/components/ui/dialog.tsx";
import PolygonSelector from "@coreModule/components/custom/polygonSelector.tsx";
import {useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import {Unit} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";
import UnitCard from "@propertyManagementModule/clients/panel/private/units/center/cardView/unitCard.tsx";
import {openActionMenuFromContextMenu} from "@coreModule/components/custom/actions/menu/openActionMenuFromContextMenu.ts";

type UnitsOverlayProps = WithLanguageType & {
    floorMainImageId: string;
    floorName: string;
    unitsCoordinates: Floor["unitsCoordinates"];
    openUnitOverlay?: boolean;
    onClose: () => void;
};

function UnitsOverlay({
    floorMainImageId,
    floorName,
    unitsCoordinates,
    openUnitOverlay,
    onClose,
    resolveLanguageKey,
}: UnitsOverlayProps) {
    const {read: readFloors} = useAccess("floors");
    const {read: readUnits} = useAccess("units");
    const [open, setOpen] = useState<boolean>(!!openUnitOverlay);
    const [selectedUnit, setSelectedUnit] = useState<string>("");

    if (!readFloors?.mainImage || !readUnits) {
        return <HiddenElement />;
    }

    if (!readFloors.mainImage || !floorMainImageId) {
        return (
            <p className="text-sm text-muted-foreground">
                {resolveLanguageKey("noMainImage")}
            </p>
        );
    }

    return (
        <>
            <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) onClose(); }}>
                <DialogContent className="flex-full xl:w-[50vw] xl:min-w-[50vw] w-screen min-w-screen max-h-screen xl:max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader>
                        <DialogTitle>
                            {resolveLanguageKey("title")}{floorName ? ` - ${floorName}` : ""}
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
                                    imageUrl={`/api/auxiliary/media/${floorMainImageId}`}
                                    phantomPoints={unitsCoordinates || []}
                                    phantomHoverContent={(item: any) => (
                                        <div className="p-1 w-fit text-sm">
                                            <p>{item.name}</p>
                                        </div>
                                    )}
                                    onFloorClick={(unit: any) => { setSelectedUnit(unit._id); }}
                                    initialPoints={[]}
                                    onPointsChange={() => {}}
                                    disabled={true}
                                />
                            </div>
                            <div className="xl:col-span-2">
                                {
                                    !selectedUnit ?
                                        <p className="font-semibold text-center">
                                            {resolveLanguageKey("noUnitSelected")}
                                        </p>
                                        :
                                        <div onContextMenu={openActionMenuFromContextMenu}>
                                            <UnitCard
                                                fetchId={selectedUnit}
                                                unit={{} as Unit}
                                            />
                                        </div>
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
    withLanguage("src/modules/propertyManagement/components/custom/floors/unitsOverlay.tsx")
)(UnitsOverlay);
