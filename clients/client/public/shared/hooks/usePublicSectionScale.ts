import {PUBLIC_FIGMA_MAX_WIDTH} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

/** Never upscale above 1:1 Figma px. On large screens, designs wider than the canvas cap scale down. */
export function computePublicSectionScale(containerWidth: number, designWidth: number) {
    if (containerWidth <= 0 || designWidth <= 0) {
        return 0;
    }

    const viewportScale = containerWidth / designWidth;
    const designCapScale =
        designWidth > PUBLIC_FIGMA_MAX_WIDTH ? PUBLIC_FIGMA_MAX_WIDTH / designWidth : 1;

    return Math.min(1, viewportScale, designCapScale);
}
