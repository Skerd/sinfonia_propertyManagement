import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {FileText} from "lucide-react";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";

type GenerateFloorsUnitsProps = WithLanguageType & {
    onAction: (action: string) => void;
}

function GenerateFloorsUnits({
    onAction,
    resolveLanguageKey
}: GenerateFloorsUnitsProps) {

    const actionKey = "generateFloorsUnits";
    const {write: writeFloors} = useAccess("floors");
    const {write: writeUnits} = useAccess("units");

    const shortcut = "3";
    const openDialog = () => {
        if( !writeUnits || !writeFloors ) return;
        onAction(actionKey);
    }
    useKeyboardShortcuts(shortcut, openDialog);

    if (!writeFloors || !writeUnits) {return <></>}

    return (
        <DropdownMenuItem onClick={() => { openDialog()}}>
            <FileText size={16}/>
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    )
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/edifices/center/actions/generateFloorsUnits.tsx"),
    withDebug(true, true, ["floors", "units"])
)(GenerateFloorsUnits);
