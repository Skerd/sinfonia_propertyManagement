import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import {useNavigate} from "react-router-dom";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Home} from "lucide-react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useDismissSheetBeforeMenuNavigate} from "@coreModule/components/viewEngine/sheetMenuNavigateDismiss.tsx";
import {buildListNavigationUrl} from "@coreModule/helpers/filter/filterUrl.ts";
import type {Floor} from "armonia/src/modules/propertyManagement/api/realEstate/private/floor/floor.dto.ts";

type ViewUnitsProps = WithLanguageType & {
    floor: Floor;
};

function ViewUnits({floor, resolveLanguageKey}: ViewUnitsProps) {
    const dismissSheetIfHosted = useDismissSheetBeforeMenuNavigate();
    const {read} = useAccess("units");
    const navigate = useNavigate();

    const shortcut = "1";
    const viewUnits = () => {
        if (!read) return;
        dismissSheetIfHosted?.();
        navigate(buildListNavigationUrl({
            path: "/realEstate/units",
            from: window.location.search,
            policy: "carry",
            scope: {
                floorId: floor._id ?? "",
                floorName: floor.name,
            },
        }));
    };
    useKeyboardShortcuts(shortcut, viewUnits);

    if (!read) return <></>;

    return (
        <DropdownMenuItem onClick={(e) => {e.preventDefault(); e.stopPropagation(); viewUnits();}}>
            <Home size={16}/>
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/floors/center/actions/viewUnits.tsx"),
    withDebug(true, true)
)(ViewUnits);
