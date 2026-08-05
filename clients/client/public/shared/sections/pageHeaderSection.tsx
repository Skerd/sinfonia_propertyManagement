import FigmaMenu from "@propertyManagementModule/clients/client/public/shared/figmaMenu.tsx";
import {PUBLIC_CONTAINER} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type PageHeaderSectionProps = {
    variant?: "hero" | "light";
};

/** Figma menu bar `35:139` — single header per page (not duplicated in layout). */
function PageHeaderSection({variant = "light"}: PageHeaderSectionProps) {
    return (
        <div className={`${PUBLIC_CONTAINER} py-4 md:py-6 lg:py-8`} data-node-id="268:328" data-name="Menu">
            <FigmaMenu variant={variant} />
        </div>
    );
}

export default PageHeaderSection;
