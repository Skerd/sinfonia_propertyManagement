import heroBg from "@propertyManagementModule/assets/images/dyeus/hero-bg.png";
import heroVideo from "@propertyManagementModule/assets/images/dyeus/hero-video.mp4";
import logoHero from "@propertyManagementModule/assets/images/dyeus/logo-hero.png";
import logoFooter from "@propertyManagementModule/assets/images/dyeus/logo-footer.png";
import mandala from "@propertyManagementModule/assets/images/dyeus/mandala.png";
import villaFeature from "@propertyManagementModule/assets/images/dyeus/villa-feature.png";
import residenceC01 from "@propertyManagementModule/assets/images/dyeus/residence-c01.png";
import residenceC04 from "@propertyManagementModule/assets/images/dyeus/residence-c04.png";
import amenitySide from "@propertyManagementModule/assets/images/dyeus/amenity-side.png";
import galleryLeft from "@propertyManagementModule/assets/images/dyeus/gallery-left.png";
import galleryRight from "@propertyManagementModule/assets/images/dyeus/gallery-right.png";
import locationCoast from "@propertyManagementModule/assets/images/dyeus/location-coast.jpg";
import iconMenu from "@propertyManagementModule/assets/images/dyeus/icon-menu.svg";
import iconLang from "@propertyManagementModule/assets/images/dyeus/icon-lang.svg";
import iconFacebook from "@propertyManagementModule/assets/images/dyeus/icon-facebook.svg";
import iconInstagram from "@propertyManagementModule/assets/images/dyeus/icon-instagram.svg";
import iconPinterest from "@propertyManagementModule/assets/images/dyeus/icon-pinterest.svg";
import lineFollow from "@propertyManagementModule/assets/images/dyeus/line-follow.svg";
import dividerPillar from "@propertyManagementModule/assets/images/dyeus/divider-pillar.svg";
import iconAvailable from "@propertyManagementModule/assets/images/dyeus/icon-available.svg";
import iconCheck from "@propertyManagementModule/assets/images/dyeus/icon-check.svg";
import iconArrowRight from "@propertyManagementModule/assets/images/dyeus/icon-arrow-right.svg";
import iconBackTop from "@propertyManagementModule/assets/images/dyeus/icon-back-top.svg";
import magazineSpread from "@propertyManagementModule/assets/images/dyeus/magazine-spread.png";
import aboutHeroPoster from "@propertyManagementModule/assets/images/dyeus/about-hero.png";
import aboutHeroVideo from "@propertyManagementModule/assets/images/dyeus/about-hero.mp4";
import aboutPool from "@propertyManagementModule/assets/images/dyeus/about-pool.png";
import aboutStairs from "@propertyManagementModule/assets/images/dyeus/about-stairs.png";
import aboutPlan from "@propertyManagementModule/assets/images/dyeus/about-plan.png";
import aboutArtech from "@propertyManagementModule/assets/images/dyeus/about-artech.png";

export const dyeusAssets = {
    heroBg,
    heroVideo,
    logoHero,
    logoFooter,
    mandala,
    villaFeature,
    residenceC01,
    residenceC04,
    amenitySide,
    galleryLeft,
    galleryRight,
    locationCoast,
    iconMenu,
    iconLang,
    iconFacebook,
    iconInstagram,
    iconPinterest,
    lineFollow,
    dividerPillar,
    iconAvailable,
    iconCheck,
    iconArrowRight,
    iconBackTop,
    magazineSpread,
    aboutHeroPoster,
    aboutHeroVideo,
    aboutPool,
    aboutStairs,
    aboutPlan,
    aboutArtech,
    // Temporary aliases for non-home pages until those screens are cloned
    hero: heroBg,
    villaPool: villaFeature,
    terrace: amenitySide,
    interior: galleryLeft,
    architecture: galleryRight,
    lounge: residenceC01,
    night: locationCoast,
    coastline: locationCoast,
    lifestyle: residenceC04,
} as const;
