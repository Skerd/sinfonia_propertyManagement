import {createOpenProjectPage} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";
import OpenProjectGallerySection from "@propertyManagementModule/clients/client/public/project/sections/openProjectGallerySection.tsx";
import OpenProject3dSection from "@propertyManagementModule/clients/client/public/project/sections/openProject3dSection.tsx";
import OpenProjectEmbeddedGridSection from "@propertyManagementModule/clients/client/public/project/sections/openProjectEmbeddedGridSection.tsx";
import type {OpenProjectContentProps} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";

function OpenProjectGalleryPageContent(props: OpenProjectContentProps) {
    return (
        <div className="flex w-full flex-col gap-10 md:gap-16">
            <OpenProjectGallerySection {...props} />
            <OpenProject3dSection {...props} showTitle={false} />
            <OpenProjectEmbeddedGridSection {...props} />
        </div>
    );
}

export default createOpenProjectPage(
    "src/modules/propertyManagement/clients/client/public/project/gallery/index.tsx",
    "472:997",
    "Open project - Gallery",
    (props) => <OpenProjectGalleryPageContent {...props} />,
);
