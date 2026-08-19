import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {ApprovalRequest} from "armonia/src/modules/propertyManagement/api/realEstate/private/approvalRequest/approvalRequest.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ApprovalRequestCard from "@propertyManagementModule/clients/panel/private/approvalRequests/center/cardView/approvalRequestCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: ApprovalRequest) {
    const params = new URLSearchParams();
    params.set("approvalRequestId", row._id);
    if (row.name) params.set("approvalRequestName", row.name);
    return `/realEstate/approvalRequests/edit?${params.toString()}`;
}

function AllApprovalRequests({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<ApprovalRequest>
            apiUrl="/api/realEstate/approvalRequest"
            collectionName="approvalrequests"
            accessModel="approvalrequests"
            tableConfigKey="approvalrequests"
            createPath="/realEstate/approvalRequests/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createApprovalRequest"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/approvalRequests/center/sheetView/approvalRequestSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            renderCard={(row, onDelete, onRestore) => (
                <ApprovalRequestCard
                    entity={row}
                    onDelete={(r: ApprovalRequest | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/approvalRequests/index.tsx"),
    withDebug(true, true, "approvalrequests"),
)(AllApprovalRequests);
