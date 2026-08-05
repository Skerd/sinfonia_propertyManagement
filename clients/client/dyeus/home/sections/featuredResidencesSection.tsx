import {Link} from "react-router-dom";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";

const cards = [
    {title: "Sea-facing suites", image: dyeusAssets.architecture},
    {title: "Garden residences", image: dyeusAssets.interior},
    {title: "Sunset terraces", image: dyeusAssets.lounge},
    {title: "Lifestyle moments", image: dyeusAssets.lifestyle},
] as const;

function FeaturedResidencesSection() {
    return (
        <section className="bg-dyeus-sand/50 px-6 py-20 md:px-12 md:py-28">
            <div className="mx-auto max-w-[1440px]">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-bronze">Residences</p>
                        <h2 className="mt-3 font-dyeus-serif text-4xl md:text-5xl">Featured living spaces</h2>
                    </div>
                    <Link
                        to="/residences"
                        className="font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-ink underline decoration-dyeus-border underline-offset-4 transition hover:decoration-dyeus-bronze"
                    >
                        View all residences
                    </Link>
                </div>
                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card) => (
                        <Link key={card.title} to="/residences" className="group block">
                            <div className="relative aspect-[3/4] overflow-hidden">
                                <img
                                    src={card.image}
                                    alt=""
                                    className="size-full object-cover transition duration-700 group-hover:scale-105"
                                />
                            </div>
                            <p className="mt-4 font-dyeus-serif text-2xl text-dyeus-ink">{card.title}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FeaturedResidencesSection;
