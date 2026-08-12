import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import {useNavigate} from "react-router-dom";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Wrench} from "lucide-react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useDismissSheetBeforeMenuNavigate} from "@coreModule/components/viewEngine/sheetMenuNavigateDismiss.tsx";
import {buildListNavigationUrl} from "@coreModule/helpers/filter/filterUrl.ts";

type ModificationRequestsProps = WithLanguageType & {
    unitId: string;
    unitName?: string;
}

function ModificationRequests({
    unitId,
    unitName,
    resolveLanguageKey
}: ModificationRequestsProps) {

    const dismissSheetIfHosted = useDismissSheetBeforeMenuNavigate();
    const {read} = useAccess("units");
    const navigate = useNavigate();

    if( !read ){
        return <></>
    }
    const shortcut = "m";
    const viewModificationRequests = () => {
        dismissSheetIfHosted?.();
        navigate(buildListNavigationUrl({
            path: "/realEstate/modificationRequests",
            from: window.location.search,
            policy: "scoped",
            scope: {
                unitId: unitId ?? "",
                unitName: unitName,
            },
        }));
    }
    useKeyboardShortcuts(shortcut, viewModificationRequests);

    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); viewModificationRequests()}}>
            <Wrench size={16}/>
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    )
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/units/center/actions/modificationRequests.tsx"),
    withDebug(true, true)
)(ModificationRequests);
