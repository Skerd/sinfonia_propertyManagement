import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconBackhoe} from "@tabler/icons-react";
import {Constructor} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructor/constructor.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ConstructorCard from "@propertyManagementModule/clients/panel/private/constructors/center/cardView/constructorCard.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";

function constructorEditPath(c: Constructor) {
    const params = new URLSearchParams();
    params.set("constructorId", c._id);
    if (c.name) params.set("constructorName", c.name);
    return `/tenancy/systemSettings/constructors/edit?${params.toString()}`;
}

function AllConstructors({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Constructor>
            apiUrl="/api/realEstate/constructor"
            collectionName="constructors"
            accessModel="constructors"
            tableConfigKey="constructors"
            createPath={`/tenancy/systemSettings/constructors/create`}
            createIcon={<IconBackhoe />}
            createLanguageKey="createConstructor"
            buildEditPath={constructorEditPath}
            resolveLanguageKey={resolveLanguageKey}
            cardViewClassName={GRID_TRANSACTIONAL}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/constructors/center/sheetView/constructorSheetView.tsx"
            renderCard={(c, onDelete, onRestore) => (
                <ConstructorCard
                    constructor={c}
                    onDelete={(row: Constructor | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(c)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/constructors/index.tsx"),
    withDebug(true, true),
)(AllConstructors);
