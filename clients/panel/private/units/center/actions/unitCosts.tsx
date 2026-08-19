import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import { compose } from "redux";
import { useNavigate } from "react-router-dom";
import { useKeyboardShortcuts } from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import { DropdownMenuItem, DropdownMenuShortcut } from "@coreModule/components/ui/dropdown-menu.tsx";
import { Receipt } from "lucide-react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import { useAccess } from "@coreModule/helpers/hocs/withAccess.tsx";
import { useDismissSheetBeforeMenuNavigate } from "@coreModule/components/viewEngine/sheetMenuNavigateDismiss.tsx";
import {buildListNavigationUrl} from "@coreModule/helpers/filter/filterUrl.ts";

type UnitCostsActionProps = WithLanguageType & {
    unitId: string;
    unitName?: string;
};

function UnitCostsAction({ unitId, unitName, resolveLanguageKey }: UnitCostsActionProps) {
    const dismissSheetIfHosted = useDismissSheetBeforeMenuNavigate();
    const { read: readUnits } = useAccess("units");
    const { read: readCosts } = useAccess("unitCosts");
    const navigate = useNavigate();

    if (!readUnits || !readCosts) {
        return null;
    }

    const shortcut = "c";
    const openUnitCosts = () => {
        dismissSheetIfHosted?.();
        navigate(buildListNavigationUrl({
            path: "/realEstate/unitCosts",
            from: window.location.search,
            policy: "scoped",
            scope: {
                unitId: unitId ?? "",
                unitName: unitName,
            },
        }));
    };
    useKeyboardShortcuts(shortcut, openUnitCosts);

    return (
        <DropdownMenuItem
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openUnitCosts();
            }}
        >
            <Receipt size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/units/center/actions/unitCosts.tsx"),
    withDebug(true, true, ["units", "unitCosts"]),
)(UnitCostsAction);
