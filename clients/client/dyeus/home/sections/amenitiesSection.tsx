const amenities = [
    "Boutique Hotel",
    "Infinity Pools",
    "Private Terraces",
    "Gardens",
    "Sunset Lounge",
    "Parking Spaces",
    "Pool Bar",
    "Bar & Restaurant",
    "Private Beach",
] as const;

function AmenitiesSection() {
    return (
        <section className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-end">
                <div>
                    <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-bronze">Lifestyle</p>
                    <h2 className="mt-4 font-dyeus-serif text-4xl leading-tight md:text-5xl">
                        Amenities designed for effortless coastal living
                    </h2>
                </div>
                <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    {amenities.map((item) => (
                        <li
                            key={item}
                            className="border-b border-dyeus-border pb-3 font-dyeus-sans text-base text-dyeus-ink-muted"
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default AmenitiesSection;
