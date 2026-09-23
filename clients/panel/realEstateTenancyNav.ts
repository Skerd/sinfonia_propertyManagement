import {
    BookMarked,
    ClipboardCheck,
    Hammer,
    Layers,
    MailPlus,
    Megaphone,
    PackageCheck,
    Settings2,
    Tag,
    TowerControl,
} from "lucide-react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {NavSubCollapsible} from "@coreModule/helpers/types/sidebarNav.types.ts";

/** Nested under Tenancy → Configurations (owned by propertyManagement). */
export function buildRealEstateTenancySettingsSubCollapsible(
    resolveLanguageKey: ResolveLanguageKey,
): NavSubCollapsible {
    return {
        title: resolveLanguageKey("menus.realEstate.title"),
        icon: TowerControl,
        permissions: [],
        usersPermissions: [],
        atLeastOnePermission: true,
        items: [
            {
                title: resolveLanguageKey("menus.realEstate.salesAndHandover.title"),
                url: "/tenancy/systemSettings/propertyManagementConfig",
                icon: Settings2,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.handoverPackages.title"),
                url: "/tenancy/systemSettings/handoverPackages",
                icon: PackageCheck,
                permissions: ["handoverpackages"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.inspectionChecklistTemplates.title"),
                url: "/tenancy/systemSettings/inspectionChecklistTemplates",
                icon: ClipboardCheck,
                permissions: ["inspectionchecklisttemplates"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.constructors.title"),
                url: "/tenancy/systemSettings/constructors",
                icon: Hammer,
                permissions: ["constructors"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.unitTypeCategories.title"),
                url: "/tenancy/systemSettings/unitTypeCategories",
                icon: Layers,
                permissions: ["unitTypeCategories"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.unitTypes.title"),
                url: "/tenancy/systemSettings/unitTypes",
                icon: Tag,
                permissions: ["unitTypes"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.storyTypes.title"),
                url: "/tenancy/systemSettings/storyTypes",
                icon: BookMarked,
                permissions: ["storyTypes"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            // {
            //     title: resolveLanguageKey("menus.realEstate.adCampaigns.title"),
            //     url: "/tenancy/systemSettings/adCampaigns",
            //     icon: Megaphone,
            //     permissions: ["adCampaigns"],
            //     usersPermissions: [],
            //     atLeastOnePermission: true,
            // },
            // {
            //     title: resolveLanguageKey("menus.realEstate.adCampaignTemplates.title"),
            //     url: "/tenancy/systemSettings/adCampaignTemplates",
            //     icon: MailPlus,
            //     permissions: ["adCampaignTemplates"],
            //     usersPermissions: [],
            //     atLeastOnePermission: true,
            // },
        ],
    };
}
