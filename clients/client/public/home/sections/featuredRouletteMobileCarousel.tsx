import {featuredRouletteSlides} from "@propertyManagementModule/clients/client/public/home/sections/featuredRouletteSlides.ts";
import {PUBLIC_CONTAINER, PUBLIC_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

function FeaturedRouletteMobileCarousel() {
    return (
        <div className={`${PUBLIC_CONTAINER} py-8`}>
            <h2 className={`${PUBLIC_TITLE} mb-8 text-center`}>Featured properties</h2>
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
                {featuredRouletteSlides.map((slide) => (
                    <article
                        key={slide.id}
                        className="w-[min(85vw,320px)] shrink-0 snap-center overflow-hidden rounded-[5px] border border-pronix-border bg-white"
                    >
                        <div className="aspect-[4/3] w-full overflow-hidden">
                            <img alt={slide.title} className="size-full object-cover" src={slide.image} />
                        </div>
                        <p className="font-aeonik-medium px-4 py-3 text-lg text-pronix-ink">{slide.title}</p>
                    </article>
                ))}
            </div>
        </div>
    );
}

export default FeaturedRouletteMobileCarousel;
