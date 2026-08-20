import {useMemo} from "react";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {useDyeusT} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";
import {PublicSnapCarousel} from "@propertyManagementModule/clients/client/public/shared/sections/publicSnapCarousel.tsx";

const HOME_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/home/index.tsx";

/** Matches prior design: “Infinity Pools” highlighted (2nd amenity). */
const ACTIVE_AMENITY_INDEX = 1;

const AMENITY_GALLERY = [
    {src: dyeusAssets.amenitySide, key: "amenity-side"},
    {src: dyeusAssets.galleryLeft, key: "gallery-left"},
    {src: dyeusAssets.galleryRight, key: "gallery-right"},
] as const;

const SNAP_SCROLLER =
    "hide-scrollbar flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function AmenitiesSection() {
    const {t, tList} = useDyeusT(HOME_LANGUAGE_PATH);

    const amenities = useMemo(() => {
        return tList("amenities").map((label, index) => ({
            label,
            active: index === ACTIVE_AMENITY_INDEX,
        }));
    }, [tList]);

    return (
        <section className="w-full px-6 py-16 md:px-[60px] md:py-20">
            <p className="max-w-[1281px] font-dyeus-serif text-[clamp(1.75rem,4vw,4rem)] font-bold leading-none text-dyeus-ink">
                {t("amenitiesLead1")}
            </p>

            <div className="mt-12 flex flex-col gap-10 lg:mt-16 lg:flex-row lg:items-start lg:justify-between">
                <p className="max-w-[340px] font-dyeus-serif text-base leading-[1.2] text-dyeus-ink md:text-xl">
                    {t("amenitiesLead2")}
                </p>

                <div className="flex flex-col gap-8 lg:w-[1020px] lg:flex-row lg:items-start lg:justify-between">
                    <ul className="flex flex-col gap-3 font-dyeus-serif text-[clamp(2rem,4vw,4rem)] font-extrabold leading-none">
                        {amenities.map((item) => (
                            <li
                                key={item.label}
                                className={item.active ? "text-dyeus-bronze" : "text-dyeus-ink-faded"}
                            >
                                {item.label}
                            </li>
                        ))}
                    </ul>

                    <div className="hidden h-[467px] w-[374px] shrink-0 overflow-hidden md:block">
                        <img
                            src={dyeusAssets.amenitySide}
                            alt=""
                            className="size-full object-cover"
                        />
                    </div>
                </div>
            </div>

            <div className="relative mt-10 min-w-0 w-full overflow-x-hidden md:hidden">
                <PublicSnapCarousel
                    scrollerClassName={SNAP_SCROLLER}
                    itemClassName="w-full min-w-full shrink-0 snap-start"
                    activeDotClassName="bg-dyeus-ink"
                    inactiveDotClassName="bg-dyeus-ink/20"
                    dotsHiddenClassName=""
                >
                    {AMENITY_GALLERY.map((item) => (
                        <div key={item.key} className="aspect-[788/1018] w-full overflow-hidden">
                            <img src={item.src} alt="" className="size-full object-cover" />
                        </div>
                    ))}
                </PublicSnapCarousel>
            </div>

            <div className="mt-16 hidden gap-8 md:grid md:grid-cols-2">
                <div className="aspect-[788/1018] overflow-hidden">
                    <img src={dyeusAssets.galleryLeft} alt="" className="size-full object-cover" />
                </div>
                <div className="aspect-[788/1018] overflow-hidden">
                    <img src={dyeusAssets.galleryRight} alt="" className="size-full object-cover" />
                </div>
            </div>
        </section>
    );
}

export default AmenitiesSection;
