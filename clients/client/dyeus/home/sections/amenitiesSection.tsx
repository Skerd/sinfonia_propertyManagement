import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";

const amenities = [
    {label: "Boutique Hotel", active: false},
    {label: "Infinity Pools", active: true},
    {label: "Private Terraces", active: false},
    {label: "Gardens", active: false},
    {label: "Sunset Lounge", active: false},
    {label: "Parking Spaces", active: false},
    {label: "Pool Bar", active: false},
    {label: "Bar & Restaurant", active: false},
    {label: "Private Beach", active: false},
] as const;

function AmenitiesSection() {
    return (
        <section className="mx-auto max-w-[1728px] px-6 py-16 md:px-[60px] md:py-20">
            <p className="max-w-[1281px] font-dyeus-serif text-[clamp(1.75rem,4vw,4rem)] font-bold leading-none text-dyeus-ink">
                Life at DYEUS happens outdoors — in the water, under the olive trees, on terraces that
                open straight to the sea. Every shared space is made for the slow, private rhythm of the
                coast.
            </p>

            <div className="mt-12 flex flex-col gap-10 lg:mt-16 lg:flex-row lg:items-start lg:justify-between">
                <p className="max-w-[340px] font-dyeus-serif text-base leading-[1.2] text-dyeus-ink md:text-xl">
                    Behind all of it is a quiet kind of care. The grounds, the pools, the running of the
                    residence — handled by the hotel alongside it, whether you&apos;re here for the season
                    or a single weekend. What&apos;s left is time that finally belongs to you: mornings with
                    nothing to manage, and evenings that ask for nothing in return.
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
