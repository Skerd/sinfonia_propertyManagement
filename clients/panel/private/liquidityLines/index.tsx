import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {LiquidityLine} from "armonia/src/modules/propertyManagement/api/realEstate/private/liquidityLine/liquidityLine.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import LiquidityLineCard from "@propertyManagementModule/clients/panel/private/liquidityLines/center/cardView/liquidityLineCard.tsx";

interface Props extends WithLanguageType {}

function buildEditPath(row: LiquidityLine) {
    const params = new URLSearchParams();
    params.set("liquidityLineId", row._id);
    if (row.name) params.set("liquidityLineName", row.name);
    return `/realEstate/liquidityLines/edit?${params.toString()}`;
}

function AllLiquidityLines({resolveLanguageKey}: Props) {
    return (
        <EntityListPage<LiquidityLine>
            apiUrl="/api/realEstate/liquidityLine"
            collectionName="liquiditylines"
            accessModel="liquiditylines"
            tableConfigKey="liquiditylines"
            createPath="/realEstate/liquidityLines/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createLiquidityLine"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/liquidityLines/center/sheetView/liquidityLineSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL}
            renderCard={(row, onDelete, onRestore) => (
                <LiquidityLineCard
                    entity={row}
                    onDelete={(r: LiquidityLine | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/liquidityLines/index.tsx"),
    withDebug(true, true, "liquiditylines"),
)(AllLiquidityLines);
