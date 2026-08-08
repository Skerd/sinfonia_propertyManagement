import {compose} from "redux";
import {useMemo} from "react";
import {useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators";
import type {ConstructionContract} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionContract/constructionContract.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ConstructionContractCard from "@propertyManagementModule/clients/panel/private/constructionContracts/center/cardView/constructionContractCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: ConstructionContract) {
    const params = new URLSearchParams();
    params.set("constructionContractId", row._id);
    if (row.name) params.set("constructionContractName", row.name);
    return `/realEstate/constructionContracts/edit?${params.toString()}`;
}

function AllConstructionContracts({resolveLanguageKey, projectId: propProjectId}: Props) {
    const [searchParams] = useSearchParams();
    const projectId = propProjectId ?? searchParams.get("projectId") ?? undefined;

    const extraParams = useMemo(() => (projectId ? {project: projectId} : undefined), [projectId]);

    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "project",
            label: resolveLanguageKey("fields.project") as string,
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/project/select",
            asExtraParam: true,
        },
        {
            field: "edifice",
            label: resolveLanguageKey("fields.edifice") as string,
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/realEstate/edifice/select",
            dependsOn: "project",
            asExtraParam: true,
        },
        {
            field: "status",
            label: resolveLanguageKey("fields.status") as string,
            type: COLUMN_TYPE.ENUM,
            enumValues: [
                {value: "draft",      label: resolveLanguageKey("fields.!enums.status.draft") as string},
                {value: "active",     label: resolveLanguageKey("fields.!enums.status.active") as string},
                {value: "suspended",  label: resolveLanguageKey("fields.!enums.status.suspended") as string},
                {value: "completed",  label: resolveLanguageKey("fields.!enums.status.completed") as string},
                {value: "terminated", label: resolveLanguageKey("fields.!enums.status.terminated") as string},
            ],
            asExtraParam: true,
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<ConstructionContract>
            apiUrl="/api/realEstate/constructionContract"
            collectionName="constructioncontracts"
            accessModel="constructioncontracts"
            tableConfigKey="constructioncontracts"
            createPath="/realEstate/constructionContracts/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createConstructionContract"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/constructionContracts/center/sheetView/constructionContractSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            extraParams={extraParams}
            quickFilters={quickFilters}
            renderCard={(row, onDelete, onRestore) => (
                <ConstructionContractCard
                    entity={row}
                    onDelete={(r: ConstructionContract | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/constructionContracts/index.tsx"),
    withDebug(true, true),
)(AllConstructionContracts);
