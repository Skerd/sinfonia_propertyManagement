import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Archive} from "lucide-react";
import {useAccess} from "@coreModule/helpers/context/accessContext.tsx";
import type {LandParcel} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/landParcel.dto.ts";

export const DISPOSE_LAND_PARCEL_ACTION = "dispose";

type Props = WithLanguageType & {
    onAction: (action: string) => void;
    landParcel?: LandParcel;
};

function Action({onAction, landParcel, resolveLanguageKey}: Props) {
    const {write} = useAccess("landparcels");
    const status = landParcel?.status ?? "prospect";
    const can = !!write && !landParcel?.deletedAt && (status === "acquired" || status === "dd_failed");
    if (!can) return null;
    return (
        <DropdownMenuItem onClick={() => {onAction(DISPOSE_LAND_PARCEL_ACTION);}}>
            <Archive className="text-warning" size={16} />
            <p className="text-warning">{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/landParcels/center/actions/dispose.tsx"),
    withDebug(true, true, "landparcels"),
)(Action);
