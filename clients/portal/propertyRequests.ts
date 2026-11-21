import type {HttpRequest} from "@coreModule/helpers/types/httpRequest.types.ts";

/* A development's and a unit's page reads; the section asks them ahead for a hovered link (`propertyProject.tsx`, `propertyUnit.tsx`). */
export const PROJECT_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/marketingProjectCatalog/single", cache: true};
export const UNIT_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/marketingUnit/single", cache: true};
