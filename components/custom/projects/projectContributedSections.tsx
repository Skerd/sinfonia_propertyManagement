import {Suspense} from "react";
import {resolveWidget} from "@coreModule/components/viewEngine/widgetRegistry.ts";
import {useAccessHydrated} from "@coreModule/helpers/context/accessContext.tsx";
import {getProjectSheetSectionSources} from "@propertyManagementModule/helpers/moduleContributions/loadPropertyManagementPanelContributions.ts";
import type {ProjectSheetSectionSource} from "@propertyManagementModule/helpers/types/propertyManagementPanelContribution.types.ts";
import {useAnyModelRead} from "@propertyManagementModule/helpers/access/useAnyModelRead.ts";

/** A contributed section, shown when its widget is registered and the caller may read one of its models. */
function ContributedSection({source, projectId}: {source: ProjectSheetSectionSource; projectId: string}) {
    const canRead = useAnyModelRead(source.accessModels);
    const Section = resolveWidget(source.widget);
    if (!canRead || !Section) return null;
    return (
        <Suspense fallback={null}>
            <Section projectId={projectId} />
        </Suspense>
    );
}

/**
 * The project sheet's sections from modules that build on propertyManagement (D119, D151), so propertyManagement
 * never names them (CORE-02). Nothing renders when none is contributed.
 */
export default function ProjectContributedSections({projectId}: {projectId: string}) {
    const accessHydrated = useAccessHydrated();
    const sources = getProjectSheetSectionSources();
    if (accessHydrated === false || sources.length === 0) return null;
    return (
        <div className="flex flex-col gap-y-4">
            {sources.map((source) => <ContributedSection key={source.widget} source={source} projectId={projectId} />)}
        </div>
    );
}
