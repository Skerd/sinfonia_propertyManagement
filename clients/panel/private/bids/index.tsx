import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL_WIDE} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {Bid} from "armonia/src/modules/propertyManagement/api/realEstate/private/bid/bid.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import BidCard from "@propertyManagementModule/clients/panel/private/bids/center/cardView/bidCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: Bid) {
    const params = new URLSearchParams();
    params.set("bidId", row._id);
    if (row.name) params.set("bidName", row.name);
    return `/realEstate/bids/edit?${params.toString()}`;
}

function AllBids({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<Bid>
            apiUrl="/api/realEstate/bid"
            collectionName="bids"
            accessModel="bids"
            tableConfigKey="bids"
            createPath="/realEstate/bids/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createBid"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/bids/center/sheetView/bidSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL_WIDE}
            renderCard={(row, onDelete, onRestore) => (
                <BidCard
                    entity={row}
                    onDelete={(r: Bid | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/bids/index.tsx"),
    withDebug(true, true),
)(AllBids);
