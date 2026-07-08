import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import {useNavigate} from "react-router-dom";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Layers} from "lucide-react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Edifice} from "armonia/src/modules/propertyManagement/api/realEstate/private/edifice/edifice.dto.ts";
import {useDismissSheetBeforeMenuNavigate} from "@coreModule/components/viewEngine/sheetMenuNavigateDismiss.tsx";
import {buildUrlWithExistingParams} from "@coreModule/helpers/general";

type ViewFloorsProps = WithLanguageType & { edifice: Edifice; }

function ViewFloors({
    edifice,
    resolveLanguageKey,
}: ViewFloorsProps) {

    const dismissSheetIfHosted = useDismissSheetBeforeMenuNavigate();
    const {read} = useAccess("floors");
    const navigate = useNavigate();

    const shortcut = "1";
    const viewFloors = () => {
        if (!read) return;
        dismissSheetIfHosted?.();
        navigate(buildUrlWithExistingParams(
            window.location.href,
            "/realEstate/floors",
            {
                edificeId: edifice._id ?? "",
                edificeName: edifice.name,
            }
        ));

    }
    useKeyboardShortcuts(shortcut, viewFloors);

    if (!read) {
        return <></>;
    }

    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); viewFloors()}}>
            <Layers size={16}/>
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    )
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/edifices/center/actions/viewFloors.tsx"),
    withDebug(true, true)
)(ViewFloors);
