import type {HomeContribution} from "@coreModule/helpers/types/homeContribution.types.ts";

/**
 * What a new property company sets up before it can take customers (D178), in the order it needs them; each
 * step is done once its list has a row. Each step's guide points at the fields that matter most (D179), and the tour
 * shows the pages an agency uses every day. Texts are in this module's `menus.json` (`setup`, `guide`).
 */
const contribution: HomeContribution = {
    id: "propertyManagement",
    order: 40,
    getSetupSteps: ({resolveLanguageKey: t}) => {
        const tip = (target: string, name: string) => ({
            target,
            title: t(`menus.propertyManagement.guide.${name}Title`),
            text: t(`menus.propertyManagement.guide.${name}Text`),
        });
        const save = {target: "form.save", title: t("home.guide.saveTitle"), text: t("home.guide.saveText")};
        return [
            {
                key: "propertyManagement.project",
                title: t("menus.propertyManagement.setup.project"),
                to: "/realEstate/projects/create",
                accessModel: "projects",
                doneWhen: {list: {url: "/api/realEstate/project"}},
                guide: [
                    tip("field.name", "projectName"),
                    tip("field.saleCommissionRatePercent", "projectCommission"),
                    tip("field.mainImage", "projectImage"),
                    tip("field.priceVisibility", "projectPrices"),
                    save,
                ],
            },
            {
                key: "propertyManagement.edifice",
                title: t("menus.propertyManagement.setup.edifice"),
                to: "/realEstate/edifices/create",
                accessModel: "edifices",
                doneWhen: {list: {url: "/api/realEstate/edifice"}},
                guide: [
                    tip("field.name", "edificeName"),
                    tip("field.address.country", "edificeAddress"),
                    tip("field.investmentValue", "edificeInvestment"),
                    tip("field.mainImage", "edificeImage"),
                    save,
                ],
            },
            {
                key: "propertyManagement.floor",
                title: t("menus.propertyManagement.setup.floor"),
                to: "/realEstate/floors/create",
                accessModel: "floors",
                doneWhen: {list: {url: "/api/realEstate/floor"}},
                guide: [
                    tip("field.edifice", "floorEdifice"),
                    tip("field.name", "floorName"),
                    tip("field.levelNumber", "floorLevel"),
                    tip("field.mainImage", "floorPlan"),
                    save,
                ],
            },
            {
                key: "propertyManagement.unitTypeCategory",
                title: t("menus.propertyManagement.setup.unitTypeCategory"),
                description: t("menus.propertyManagement.setup.unitTypeCategoryHint"),
                to: "/tenancy/systemSettings/unitTypeCategories/create",
                accessModel: "unittypecategories",
                doneWhen: {list: {url: "/api/realEstate/unitTypeCategory"}},
                // The form has the name only.
                guide: [tip("field.name", "categoryName"), save],
            },
            {
                key: "propertyManagement.unitType",
                title: t("menus.propertyManagement.setup.unitType"),
                description: t("menus.propertyManagement.setup.unitTypeHint"),
                to: "/tenancy/systemSettings/unitTypes/create",
                accessModel: "unittypes",
                doneWhen: {list: {url: "/api/realEstate/unitType"}},
                guide: [tip("field.name", "unitTypeName"), tip("field.category", "unitTypeCategory"), save],
            },
            {
                key: "propertyManagement.unit",
                title: t("menus.propertyManagement.setup.unit"),
                to: "/realEstate/units/create",
                accessModel: "units",
                doneWhen: {list: {url: "/api/realEstate/unit"}},
                guide: [
                    tip("field.floor", "unitFloor"),
                    tip("field.unitNumber", "unitNumber"),
                    tip("field.unitType", "unitKind"),
                    tip("field.price", "unitPrice"),
                    save,
                ],
            },
        ];
    },
    // Sidebar links, shown from wherever the person is, each left out without its link's model (the dashboard's link
    // takes any of several, so it names none); the tour then ends at the last one's page help.
    getTour: ({resolveLanguageKey: t}) => ([
        ["dashboard", undefined],
        ["units", "units"],
        ["leads", "leads"],
        ["reservations", "reservations"],
        ["sales", "sales"],
    ] as const).map(([page, accessModel]) => ({
        target: `nav:/realEstate/${page}`,
        // Named as the sidebar names them.
        title: t(`menus.realEstate.${page}.title`),
        text: t(`menus.propertyManagement.guide.tour.${page}`),
        accessModel,
    })),
};

export default contribution;
