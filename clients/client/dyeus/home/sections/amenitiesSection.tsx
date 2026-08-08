import {useMemo} from "react";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {useDyeusT} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";

const HOME_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/home/index.tsx";

/** Matches prior design: “Infinity Pools” highlighted (2nd amenity). */
const ACTIVE_AMENITY_INDEX = 1;

function AmenitiesSection() {
    const {t, tList} = useDyeusT(HOME_LANGUAGE_PATH);

    const amenities = useMemo(() => {
        return tList("amenities").map((label, index) => ({
            label,
            active: index === ACTIVE_AMENITY_INDEX,
        }));
    }, [tList]);

    return (
        <section className="mx-auto max-w-[1728px] px-6 py-16 md:px-[60px] md:py-20">
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

                    <div className="h-[360px] w-full overflow-hidden lg:h-[467px] lg:w-[374px] lg:shrink-0">
                        <img
                            src={dyeusAssets.amenitySide}
                            alt=""
                            className="size-full object-cover"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2">
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
