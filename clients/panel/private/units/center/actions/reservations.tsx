import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import {useNavigate} from "react-router-dom";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconCalendar} from "@tabler/icons-react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {useDismissSheetBeforeMenuNavigate} from "@coreModule/components/viewEngine/sheet/widgets/sheetMenuNavigateDismiss.tsx";
import {buildListNavigationUrl} from "@coreModule/helpers/filter/filterUrl.ts";

type ReservationsProps = WithLanguageType & {
    unitId: string;
    unitName?: string;
}

function Reservations({
    unitId,
    unitName,
    resolveLanguageKey
}: ReservationsProps) {

    const dismissSheetIfHosted = useDismissSheetBeforeMenuNavigate();
    const {read} = useAccess("units");
    const navigate = useNavigate();

    const shortcut = "r";
    const viewReservations = () => {
        dismissSheetIfHosted?.();
        navigate(buildListNavigationUrl({
            path: "/realEstate/reservations",
            from: window.location.search,
            policy: "scoped",
            scope: {
                unitId: unitId ?? "",
                unitName: unitName,
            },
        }));
    }
    useKeyboardShortcuts(shortcut, viewReservations, {enabled: read});

    if (!read) {
        return null;
    }

    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); viewReservations()}}>
            <IconCalendar size={16}/>
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    )
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/units/center/actions/reservations.tsx"),
    withDebug(true, true, "units")
)(Reservations);
