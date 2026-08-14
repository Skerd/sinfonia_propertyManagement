import FigmaMenu from "@propertyManagementModule/clients/client/public/shared/figmaMenu.tsx";
import {PUBLIC_PAGE_HEADER} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

type PageHeaderSectionProps = {
    variant?: "hero" | "light";
};

/** Figma menu bar `35:139` — same inset as the home hero (not the 1728px content frame). */
function PageHeaderSection({variant = "light"}: PageHeaderSectionProps) {
    return (
        <div className={PUBLIC_PAGE_HEADER} data-node-id="268:328" data-name="Menu">
            <FigmaMenu variant={variant} />
        </div>
    );
}

export default PageHeaderSection;
