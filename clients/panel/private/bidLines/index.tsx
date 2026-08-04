import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {BidLine} from "armonia/src/modules/propertyManagement/api/realEstate/private/bidLine/bidLine.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import BidLineCard from "@propertyManagementModule/clients/panel/private/bidLines/center/cardView/bidLineCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: BidLine) {
    const params = new URLSearchParams();
    params.set("bidLineId", row._id);
    if (row.name) params.set("bidLineName", row.name);
    return `/realEstate/bidLines/edit?${params.toString()}`;
}

function AllBidLines({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<BidLine>
            apiUrl="/api/realEstate/bidLine"
            collectionName="bidlines"
            accessModel="bidlines"
            tableConfigKey="bidlines"
            createPath="/realEstate/bidLines/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createBidLine"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/bidLines/center/sheetView/bidLineSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            renderCard={(row, onDelete, onRestore) => (
                <BidLineCard
                    entity={row}
                    onDelete={(r: BidLine | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/bidLines/index.tsx"),
    withDebug(true, true),
)(AllBidLines);
