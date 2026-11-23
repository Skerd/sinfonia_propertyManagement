import type {HomeContribution} from "@coreModule/helpers/types/homeContribution.types.ts";

/**
 * What a new property company sets up before it can take customers (D178), in the order it needs them; each
 * step is done once its list has a row. Labels are in this module's `menus.json`.
 */
const contribution: HomeContribution = {
    id: "propertyManagement",
    order: 40,
    getSetupSteps: ({resolveLanguageKey: t}) => [
        {
            key: "propertyManagement.project",
            title: t("menus.propertyManagement.setup.project"),
            to: "/realEstate/projects/create",
            accessModel: "projects",
            doneWhen: {list: {url: "/api/realEstate/project"}},
        },
        {
            key: "propertyManagement.edifice",
            title: t("menus.propertyManagement.setup.edifice"),
            to: "/realEstate/edifices/create",
            accessModel: "edifices",
            doneWhen: {list: {url: "/api/realEstate/edifice"}},
        },
        {
            key: "propertyManagement.floor",
            title: t("menus.propertyManagement.setup.floor"),
            to: "/realEstate/floors/create",
            accessModel: "floors",
            doneWhen: {list: {url: "/api/realEstate/floor"}},
        },
        {
            key: "propertyManagement.unitTypeCategory",
            title: t("menus.propertyManagement.setup.unitTypeCategory"),
            description: t("menus.propertyManagement.setup.unitTypeCategoryHint"),
            to: "/tenancy/systemSettings/unitTypeCategories/create",
            accessModel: "unittypecategories",
            doneWhen: {list: {url: "/api/realEstate/unitTypeCategory"}},
        },
        {
            key: "propertyManagement.unitType",
            title: t("menus.propertyManagement.setup.unitType"),
            description: t("menus.propertyManagement.setup.unitTypeHint"),
            to: "/tenancy/systemSettings/unitTypes/create",
            accessModel: "unittypes",
            doneWhen: {list: {url: "/api/realEstate/unitType"}},
        },
        {
            key: "propertyManagement.unit",
            title: t("menus.propertyManagement.setup.unit"),
            to: "/realEstate/units/create",
            accessModel: "units",
            doneWhen: {list: {url: "/api/realEstate/unit"}},
        },
    ],
};

export default contribution;
