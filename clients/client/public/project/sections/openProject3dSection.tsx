import {OpenProjectContentProps} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";
import ProjectPolygonViewer from "@propertyManagementModule/clients/client/public/project/shared/projectPolygonViewer.tsx";
import {PUBLIC_SUBTITLE, PUBLIC_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

function OpenProject3dSection({
    project,
    resolveLanguageKey,
    showTitle = true,
}: OpenProjectContentProps & {showTitle?: boolean; showPropertiesPanel?: boolean}) {
    return (
        <div className="flex w-full flex-col gap-6">
            {showTitle && (
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
            )}

            <ProjectPolygonViewer project={project} resolveLanguageKey={resolveLanguageKey} />
        </div>
    );
}

export default OpenProject3dSection;
