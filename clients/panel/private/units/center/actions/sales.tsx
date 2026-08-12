import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import {useNavigate} from "react-router-dom";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {DollarSign} from "lucide-react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useDismissSheetBeforeMenuNavigate} from "@coreModule/components/viewEngine/sheetMenuNavigateDismiss.tsx";
import {buildListNavigationUrl} from "@coreModule/helpers/filter/filterUrl.ts";

type SalesProps = WithLanguageType & {
    unitId: string;
    unitName?: string;
}

function Sales({
    unitId,
    unitName,
    resolveLanguageKey
}: SalesProps) {

    const dismissSheetIfHosted = useDismissSheetBeforeMenuNavigate();
    const {read} = useAccess("units");
    const navigate = useNavigate();

    if( !read ){
        return <></>
    }
    const shortcut = "s";
    const viewSales = () => {
        dismissSheetIfHosted?.();
        navigate(buildListNavigationUrl({
            path: "/realEstate/sales",
            from: window.location.search,
            policy: "scoped",
            scope: {
                unitId: unitId ?? "",
                unitName: unitName,
            },
        }));
    }
    useKeyboardShortcuts(shortcut, viewSales);

    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); viewSales()}}>
            <DollarSign size={16}/>
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    )
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/units/center/actions/sales.tsx"),
    withDebug(true, true)
)(Sales);
