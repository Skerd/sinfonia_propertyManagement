import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {BadgeCheck} from "lucide-react";
import {useAccess} from "@coreModule/helpers/context/accessContext.tsx";
import type {LandParcel} from "armonia/src/modules/propertyManagement/api/realEstate/private/landParcel/landParcel.dto.ts";

export const CONCLUDE_DUE_DILIGENCE_LAND_PARCEL_ACTION = "concludeDueDiligence";

type Props = WithLanguageType & {
    onAction: (action: string) => void;
    landParcel?: LandParcel;
};

function Action({onAction, landParcel, resolveLanguageKey}: Props) {
    const {write} = useAccess("landparcels");
    const status = landParcel?.status ?? "prospect";
    const can = !!write && !landParcel?.deletedAt && status === "under_dd";
    if (!can) return null;
    return (
        <DropdownMenuItem onClick={() => {onAction(CONCLUDE_DUE_DILIGENCE_LAND_PARCEL_ACTION);}}>
            <BadgeCheck className="text-primary" size={16} />
            <p>{resolveLanguageKey("title")}</p>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/landParcels/center/actions/concludeDueDiligence.tsx"),
    withDebug(true, true, "landparcels"),
)(Action);
