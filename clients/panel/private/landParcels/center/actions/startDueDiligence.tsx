import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {FileSearch} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {LandParcel} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/landParcel.dto.ts";

export const START_DUE_DILIGENCE_LAND_PARCEL_ACTION = "startDueDiligence";

type Props = WithLanguageType & {
    onAction: (action: string) => void;
    landParcel?: LandParcel;
};

function Action({onAction, landParcel, resolveLanguageKey}: Props) {
    const {write} = useAccess("landparcels");
    const status = landParcel?.status ?? "prospect";
    const can = !!write && !landParcel?.deletedAt && (status === "prospect" || status === "dd_failed");
    if (!can) return null;
    const titleKey = status === "dd_failed" ? "restartTitle" : "title";
    return (
        <DropdownMenuItem onClick={() => {onAction(START_DUE_DILIGENCE_LAND_PARCEL_ACTION);}}>
            <FileSearch className="text-primary" size={16} />
            <p>{resolveLanguageKey(titleKey)}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/landParcels/center/actions/startDueDiligence.tsx"),
    withDebug(true, true, "landparcels"),
)(Action);
