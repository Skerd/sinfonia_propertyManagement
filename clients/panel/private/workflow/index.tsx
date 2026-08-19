import {compose} from "redux";
import withLanguage, {type WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {FlowDiagram} from "@coreModule/components/custom/systemMap/FlowDiagram.tsx";
import {PROPERTY_MANAGEMENT_MENU_FLOWS} from "@propertyManagementModule/clients/panel/private/workflow/workflow.data.ts";

function PropertyManagementWorkflow({resolveLanguageKey}: WithLanguageType) {
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);

    return (
        <div className="flex h-full min-h-0 flex-col gap-4 p-6">
            <header className="shrink-0">
                <h2 className="text-xl font-semibold">{rk("title")}</h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-3xl leading-relaxed">
                    {rk("description")}
                </p>
            </header>
            <div className="flex min-h-0 flex-1 flex-col">
                <FlowDiagram flows={PROPERTY_MANAGEMENT_MENU_FLOWS} />
            </div>
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/workflow/index.tsx"),
    withDebug(true, true),
)(PropertyManagementWorkflow);
