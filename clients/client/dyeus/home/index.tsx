import {compose} from "redux";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import HeroSection from "@propertyManagementModule/clients/client/dyeus/home/sections/heroSection.tsx";
import IntroSection from "@propertyManagementModule/clients/client/dyeus/home/sections/introSection.tsx";
import ImagerySection from "@propertyManagementModule/clients/client/dyeus/home/sections/imagerySection.tsx";
import FeaturesTickerSection from "@propertyManagementModule/clients/client/dyeus/home/sections/featuresTickerSection.tsx";
import FeaturedResidencesSection from "@propertyManagementModule/clients/client/dyeus/home/sections/featuredResidencesSection.tsx";
import AmenitiesSection from "@propertyManagementModule/clients/client/dyeus/home/sections/amenitiesSection.tsx";
import LocationSection from "@propertyManagementModule/clients/client/dyeus/home/sections/locationSection.tsx";

function HomePage() {
    return (
        <DyeusPageShell nodeId="287:12" nodeName="Home">
            <HeroSection />
            <IntroSection />
            <ImagerySection />
            <FeaturesTickerSection />
            <FeaturedResidencesSection />
            <AmenitiesSection />
            <LocationSection />
            <DyeusFooter />
        </DyeusPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/home/index.tsx"),
    withDebug(true, true),
)(HomePage);
