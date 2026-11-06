import {IconAdjustmentsHorizontal, IconBookmarks, IconBuildingBroadcastTower, IconClipboardCheck, IconHammer, IconMailPlus, IconPackageExport, IconSpeakerphone, IconStack2, IconTag} from "@tabler/icons-react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {NavSubCollapsible} from "@coreModule/helpers/types/sidebarNav.types.ts";

/** Nested under Tenancy → Configurations (owned by propertyManagement). */
export function buildRealEstateTenancySettingsSubCollapsible(
    resolveLanguageKey: ResolveLanguageKey,
): NavSubCollapsible {
    return {
        title: resolveLanguageKey("menus.realEstate.title"),
        icon: IconBuildingBroadcastTower,
        permissions: [],
        usersPermissions: [],
        atLeastOnePermission: true,
        items: [
            {
                title: resolveLanguageKey("menus.realEstate.salesAndHandover.title"),
                url: "/tenancy/systemSettings/propertyManagementConfig",
                icon: IconAdjustmentsHorizontal,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.handoverPackages.title"),
                url: "/tenancy/systemSettings/handoverPackages",
                icon: IconPackageExport,
                permissions: ["handoverpackages"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.inspectionChecklistTemplates.title"),
                url: "/tenancy/systemSettings/inspectionChecklistTemplates",
                icon: IconClipboardCheck,
                permissions: ["inspectionchecklisttemplates"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.constructors.title"),
                url: "/tenancy/systemSettings/constructors",
                icon: IconHammer,
                permissions: ["constructors"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.unitTypeCategories.title"),
                url: "/tenancy/systemSettings/unitTypeCategories",
                icon: IconStack2,
                permissions: ["unitTypeCategories"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.unitTypes.title"),
                url: "/tenancy/systemSettings/unitTypes",
                icon: IconTag,
                permissions: ["unitTypes"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.storyTypes.title"),
                url: "/tenancy/systemSettings/storyTypes",
                icon: IconBookmarks,
                permissions: ["storyTypes"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.adCampaigns.title"),
                url: "/tenancy/systemSettings/adCampaigns",
                icon: IconSpeakerphone,
                permissions: ["adCampaigns"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.adCampaignTemplates.title"),
                url: "/tenancy/systemSettings/adCampaignTemplates",
                icon: IconMailPlus,
                permissions: ["adCampaignTemplates"],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
        ],
    };
}
