import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import {useNavigate} from "react-router-dom";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {ClipboardCheck} from "lucide-react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useDismissSheetBeforeMenuNavigate} from "@coreModule/components/viewEngine/sheetMenuNavigateDismiss.tsx";
import {buildListNavigationUrl} from "@coreModule/helpers/filter/filterUrl.ts";

type InspectionsProps = WithLanguageType & {
    unitId: string;
    unitName?: string;
}

function Inspections({
    unitId,
    unitName,
    resolveLanguageKey
}: InspectionsProps) {

    const dismissSheetIfHosted = useDismissSheetBeforeMenuNavigate();
    const {read} = useAccess("units");
    const navigate = useNavigate();

    if( !read ){
        return <></>
    }
    const shortcut = "i";
    const viewInspections = () => {
        dismissSheetIfHosted?.();
        navigate(buildListNavigationUrl({
            path: "/realEstate/inspections",
            from: window.location.search,
            policy: "scoped",
            scope: {
                unitId: unitId ?? "",
                unitName: unitName,
            },
        }));
    }
    useKeyboardShortcuts(shortcut, viewInspections);

    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); viewInspections()}}>
            <ClipboardCheck size={16}/>
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    )
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/units/center/actions/inspections.tsx"),
    withDebug(true, true)
)(Inspections);
