import {createOpenProjectPage} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";
import OpenProjectFinanceSection from "@propertyManagementModule/clients/client/public/project/sections/openProjectFinanceSection.tsx";

export default createOpenProjectPage(
    "src/modules/propertyManagement/clients/client/public/project/finance/index.tsx",
    "475:1240",
    "Open project - Finance",
    (props) => <OpenProjectFinanceSection {...props} />,
);
