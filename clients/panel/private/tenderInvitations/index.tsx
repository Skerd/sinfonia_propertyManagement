import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL_WIDE} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {TenderInvitation} from "armonia/src/modules/propertyManagement/api/realEstate/private/tenderInvitation/tenderInvitation.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import TenderInvitationCard from "@propertyManagementModule/clients/panel/private/tenderInvitations/center/cardView/tenderInvitationCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: TenderInvitation) {
    const params = new URLSearchParams();
    params.set("tenderInvitationId", row._id);
    if (row.name) params.set("tenderInvitationName", row.name);
    return `/realEstate/tenderInvitations/edit?${params.toString()}`;
}

function AllTenderInvitations({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<TenderInvitation>
            apiUrl="/api/realEstate/tenderInvitation"
            collectionName="tenderinvitations"
            accessModel="tenderinvitations"
            tableConfigKey="tenderinvitations"
            createPath="/realEstate/tenderInvitations/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createTenderInvitation"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/tenderInvitations/center/sheetView/tenderInvitationSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL_WIDE}
            renderCard={(row, onDelete, onRestore) => (
                <TenderInvitationCard
                    entity={row}
                    onDelete={(r: TenderInvitation | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/tenderInvitations/index.tsx"),
    withDebug(true, true),
)(AllTenderInvitations);
