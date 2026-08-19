import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {ApprovalWorkflow} from "armonia/src/modules/propertyManagement/api/realEstate/private/approvalWorkflow/approvalWorkflow.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ApprovalWorkflowCard from "@propertyManagementModule/clients/panel/private/approvalWorkflows/center/cardView/approvalWorkflowCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: ApprovalWorkflow) {
    const params = new URLSearchParams();
    params.set("approvalWorkflowId", row._id);
    if (row.name) params.set("approvalWorkflowName", row.name);
    return `/realEstate/approvalWorkflows/edit?${params.toString()}`;
}

function AllApprovalWorkflows({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<ApprovalWorkflow>
            apiUrl="/api/realEstate/approvalWorkflow"
            collectionName="approvalworkflows"
            accessModel="approvalworkflows"
            tableConfigKey="approvalworkflows"
            createPath="/realEstate/approvalWorkflows/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createApprovalWorkflow"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/approvalWorkflows/center/sheetView/approvalWorkflowSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            renderCard={(row, onDelete, onRestore) => (
                <ApprovalWorkflowCard
                    entity={row}
                    onDelete={(r: ApprovalWorkflow | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/approvalWorkflows/index.tsx"),
    withDebug(true, true, "approvalworkflows"),
)(AllApprovalWorkflows);
