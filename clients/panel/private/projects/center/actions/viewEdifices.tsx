import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import {useNavigate} from "react-router-dom";
import {useKeyboardShortcuts} from "@coreModule/helpers/hooks/useKeyboardShortcut.ts";
import {DropdownMenuItem, DropdownMenuShortcut} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Building2} from "lucide-react";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {Project} from "armonia/src/modules/propertyManagement/api/realEstate/private/project/project.dto.ts";
import {useDismissSheetBeforeMenuNavigate} from "@coreModule/components/viewEngine/sheetMenuNavigateDismiss.tsx";
import {buildListNavigationUrl} from "@coreModule/helpers/filter/filterUrl.ts";

type ViewEdificesProps = WithLanguageType & {
    project: Project
}

function ViewEdifices({
    project,
    resolveLanguageKey
}: ViewEdificesProps) {

    const dismissSheetIfHosted = useDismissSheetBeforeMenuNavigate();
    const {read} = useAccess("edifices");
    const navigate = useNavigate();

    const shortcut = "1";
    const viewEdifices = () => {
        if (!read) return;
        dismissSheetIfHosted?.();
        // Scoped entry: project scope only — do not carry units/projects list filters.
        navigate(buildListNavigationUrl({
            path: "/realEstate/edifices",
            from: window.location.search,
            policy: "scoped",
            scope: {
                projectId: project._id ?? "",
                projectName: project.name,
            },
        }));
    };
    useKeyboardShortcuts(shortcut, viewEdifices);

    if (!read) {
        return <></>;
    }

    return (
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); viewEdifices(); }}>
            <Building2 size={16}/>
            {resolveLanguageKey("title")}
            <DropdownMenuShortcut>⌘{shortcut}</DropdownMenuShortcut>
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/projects/center/actions/viewEdifices.tsx"),
    withDebug(true, true, "edifices")
)(ViewEdifices);
