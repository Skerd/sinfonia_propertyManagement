import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {CatalogFilterInput, CatalogFilterSelect} from "@coreModule/clients/portal/shared/catalogFilters.tsx";
import {
    MARKETING_BEDROOM_FILTERS,
    MARKETING_PROPERTY_TYPE_IDS,
} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingProjectsCatalog/marketingProjectsCatalog.shared.types.ts";

/** The property catalog's filters: what kind of home, how many bedrooms, how large. */
function PropertyCatalogFilters({resolveLanguageKey}: WithLanguageType) {
    const any = resolveLanguageKey("any");
    return (
        <>
            <CatalogFilterSelect
                name="propertyType"
                label={resolveLanguageKey("propertyType")}
                anyLabel={any}
                options={MARKETING_PROPERTY_TYPE_IDS.map((value) => ({value, label: resolveLanguageKey(`propertyTypes.${value}`)}))}
            />
            <CatalogFilterSelect
                name="bedrooms"
                label={resolveLanguageKey("bedrooms")}
                anyLabel={any}
                options={MARKETING_BEDROOM_FILTERS.filter((value) => value !== "any").map((value) => ({value, label: value}))}
            />
            <CatalogFilterInput name="areaSqmMin" type="number" label={resolveLanguageKey("areaSqmMin")} />
        </>
    );
}

export default compose(withLanguage("src/modules/propertyManagement/clients/portal/propertyCatalogFilters.tsx"))(PropertyCatalogFilters);
