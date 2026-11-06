import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import { compose } from "redux";
import { useNavigate } from "react-router-dom";
import { useKeyboardShortcuts } from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import { DropdownMenuItem, DropdownMenuShortcut } from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconReceipt} from "@tabler/icons-react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import { useDismissSheetBeforeMenuNavigate } from "@coreModule/components/viewEngine/sheet/widgets/sheetMenuNavigateDismiss.tsx";
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
    const canOpen = readUnits && readCosts;
    useKeyboardShortcuts(shortcut, openUnitCosts, {enabled: canOpen});

    if (!canOpen) {
        return null;
    }

    return (
        <DropdownMenuItem
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openUnitCosts();
            }}
        >
            <IconReceipt size={16} />
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/units/center/actions/unitCosts.tsx"),
    withDebug(true, true, ["units", "unitCosts"]),
)(UnitCostsAction);
