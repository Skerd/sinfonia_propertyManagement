import type {HomeContribution} from "@coreModule/helpers/types/homeContribution.types.ts";

/**
 * What a new property company sets up before it can take customers (D178), in the order it needs them; each
 * step is done once its list has a row. Each step's guide points at the fields that matter most (D179), and the tour
 * walks every page of the module (D180). Texts are in this module's `menus.json` (`setup`, `guide`).
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
    // Every page of the module in sidebar order, then its settings, each explained by its own ⓘ help (D180); a page the
    // person may not read is left out. A page whose sidebar link takes any of several models names the one it is about.
    getTour: ({resolveLanguageKey: t}) => [
        {
            target: "page.help",
            to: "/realEstate/overview",
            accessModel: "units",
            title: t("menus.propertyManagement.guide.tour.introTitle"),
            text: t("menus.propertyManagement.guide.tour.introText"),
        },
        ...([
            ["/realEstate/overview", "units"],
            ["/realEstate/dashboard", "units"],
            ["/realEstate/projects", "projects"],
            ["/realEstate/edifices", "edifices"],
            ["/realEstate/floors", "floors"],
            ["/realEstate/units", "units"],
            ["/realEstate/constructionProgress", "constructionprogresses"],
            ["/realEstate/leads", "leads"],
            ["/realEstate/inspections", "inspections"],
            ["/realEstate/modificationRequests", "modificationRequests"],
            ["/realEstate/reservations", "reservations"],
            ["/realEstate/sales", "sales"],
            ["/realEstate/contractsHub", "sales"],
            ["/realEstate/commissions", "commissions"],
            ["/realEstate/stories", "stories"],
            ["/realEstate/paymentsHub", "paymentplans"],
            ["/realEstate/unitCosts", "unitCosts"],
            ["/realEstate/rentalsHub", "leases"],
            ["/realEstate/leases", "leases"],
            ["/realEstate/rentalPayments", "rentalpayments"],
            ["/realEstate/groupDashboard", "units"],
            ["/realEstate/agentReport", "sales"],
            ["/realEstate/roi", "units"],
            ["/realEstate/erpExport", "sales"],
            ["/tenancy/systemSettings/propertyManagementConfig", "propertymanagementconfigs"],
            ["/tenancy/systemSettings/handoverPackages", "handoverpackages"],
            ["/tenancy/systemSettings/inspectionChecklistTemplates", "inspectionchecklisttemplates"],
            ["/tenancy/systemSettings/constructors", "constructors"],
            ["/tenancy/systemSettings/unitTypeCategories", "unitTypeCategories"],
            ["/tenancy/systemSettings/unitTypes", "unitTypes"],
            ["/tenancy/systemSettings/storyTypes", "storyTypes"],
            ["/tenancy/systemSettings/adCampaigns", "adCampaigns"],
            ["/tenancy/systemSettings/adCampaignTemplates", "adCampaignTemplates"],
        ] as const).map(([page, accessModel]) => ({page, accessModel})),
    ],
};

export default contribution;
