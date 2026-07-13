import {createOpenProjectPage} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";
import OpenProject3dSection from "@propertyManagementModule/clients/client/public/project/sections/openProject3dSection.tsx";

export default createOpenProjectPage(
    "src/modules/propertyManagement/clients/client/public/project/3d/index.tsx",
    "467:685",
    "Open project - 3D",
    (props) => <OpenProject3dSection {...props} />,
);
