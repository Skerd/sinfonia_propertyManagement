import {createOpenProjectPage} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";
import OpenProjectGallerySection from "@propertyManagementModule/clients/client/public/project/sections/openProjectGallerySection.tsx";

export default createOpenProjectPage(
    "src/modules/propertyManagement/clients/client/public/project/gallery/index.tsx",
    "472:997",
    "Open project - Gallery",
    (props) => <OpenProjectGallerySection {...props} />,
);
