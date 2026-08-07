import {BookMarked, Hammer, Layers, Settings2, Tag, TowerControl} from "lucide-react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {NavSubCollapsible} from "@coreModule/helpers/panel/sidebarNav.types.ts";

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
                title: resolveLanguageKey("menus.realEstate.constructors.title"),
                url: "/tenancy/systemSettings/constructors",
                icon: Hammer,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.unitTypeCategories.title"),
                url: "/tenancy/systemSettings/unitTypeCategories",
                icon: Layers,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.unitTypes.title"),
                url: "/tenancy/systemSettings/unitTypes",
                icon: Tag,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
            {
                title: resolveLanguageKey("menus.realEstate.storyTypes.title"),
                url: "/tenancy/systemSettings/storyTypes",
                icon: BookMarked,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
        ],
    };
}
