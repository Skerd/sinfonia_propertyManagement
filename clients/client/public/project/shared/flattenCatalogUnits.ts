import {
    MarketingProjectSingle,
    MarketingUnitListItem,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {PropertyListingCardUnit} from "@propertyManagementModule/clients/client/public/project/shared/propertyListingCard.tsx";
import {resolveMarketingMediaUrl} from "@propertyManagementModule/clients/client/public/shared/resolveMarketingMedia.ts";

function mapCatalogUnit(
    unit: MarketingUnitListItem,
    floorLabel: string,
    floorId: string,
    edificeId: string,
    edificeName?: string,
): PropertyListingCardUnit {
    return {
        _id: unit._id,
        name: unit.name,
        status: unit.status,
        areaSqm: unit.areaSqm,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        floorLabel: unit.floorLabel ?? floorLabel,
        floorId: unit.floorId ?? floorId,
        edificeId: unit.edificeId ?? edificeId,
        edificeName: edificeName || undefined,
        price: unit.price,
        propertyType: unit.propertyType,
        imageUrl: resolveMarketingMediaUrl(unit.mainImage),
    };
}

export function flattenCatalogUnits(project: MarketingProjectSingle): PropertyListingCardUnit[] {
    return (
        project.edifices?.flatMap((edifice) =>
            (edifice.floors ?? []).flatMap((floor) =>
                (floor.units ?? []).map((unit) =>
                    mapCatalogUnit(unit, floor.name, floor._id, edifice._id, edifice.name),
                ),
            ),
        ) ?? []
    );
}
