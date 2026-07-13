import {OpenProjectContentProps} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";
import ProjectViewActions from "@propertyManagementModule/clients/client/public/project/shared/projectViewActions.tsx";
import ProjectPolygonViewer from "@propertyManagementModule/clients/client/public/project/shared/projectPolygonViewer.tsx";
import OpenProject3dFloorPropertiesSection from "@propertyManagementModule/clients/client/public/project/sections/openProject3dFloorPropertiesSection.tsx";
import {useProjectViewerParams} from "@propertyManagementModule/clients/client/public/project/shared/useProjectViewerParams.ts";
import {PUBLIC_SUBTITLE, PUBLIC_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {useState} from "react";

function OpenProject3dSection({
    project,
    resolveLanguageKey,
    currentLanguage,
    languageCode,
    showViewActions = true,
    showPropertiesPanel = true,
}: OpenProjectContentProps & {showViewActions?: boolean; showPropertiesPanel?: boolean}) {
    const {floorId} = useProjectViewerParams();
    const [activeFilter, setActiveFilter] = useState("all");

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-2" data-node-id="467:825">
                <h1 className={PUBLIC_TITLE} data-node-id="467:821">
                    {project.name}
                </h1>
                {project.location && (
                    <p className={PUBLIC_SUBTITLE} data-node-id="467:823">
                        {project.location}
                    </p>
                )}
            </div>

            <ProjectPolygonViewer project={project} resolveLanguageKey={resolveLanguageKey} />

            {showPropertiesPanel && floorId && (
                <OpenProject3dFloorPropertiesSection
                    project={project}
                    resolveLanguageKey={resolveLanguageKey}
                    currentLanguage={currentLanguage}
                    languageCode={languageCode}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                />
            )}

            {showViewActions && <ProjectViewActions />}
        </div>
    );
}

export default OpenProject3dSection;
