import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {ProjectDocument} from "armonia/src/modules/propertyManagement/api/realEstate/private/projectDocument/projectDocument.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";

export type ProjectDocumentSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectDocument?: ProjectDocument;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function buildProjectDocumentEditPath(projectDocument: ProjectDocument) {
    const params = new URLSearchParams();
    params.set("projectDocumentId", projectDocument._id);
    if (projectDocument.name) params.set("projectDocumentName", projectDocument.name);
    if (projectDocument.project?._id) params.set("projectId", projectDocument.project._id);
    if (projectDocument.project?.name) params.set("projectName", projectDocument.project.name);
    return `/realEstate/projectDocuments/edit?${params.toString()}`;
}

function ProjectDocumentSheetView({
    open,
    onOpenChange,
    projectDocument: projectDocumentProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: ProjectDocumentSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, any>>(projectDocumentProp || {_id: fetchId});
    const access = useAccess("projectdocuments");
    const viewConfig = useViewConfig("projectdocuments", "sheet");

    useEffect(() => {
        if (!projectDocumentProp) return;
        setSheetData(projectDocumentProp);
    }, [projectDocumentProp]);

    const entityId = projectDocumentProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/realEstate/projectDocument/single"
            fetchId={fetchId}
            onDataFetched={(data) => setSheetData(data)}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={buildProjectDocumentEditPath(sheetData as ProjectDocument)}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/projectDocuments/center/sheetView/projectDocumentSheetView.tsx"),
    withDebug(true, true),
)(ProjectDocumentSheetView);
