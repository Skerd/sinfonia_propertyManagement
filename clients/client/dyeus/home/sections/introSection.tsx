const pillars = [
    {id: "sea", label: "sea", copy: "Private beach access and endless horizon."},
    {id: "light", label: "light", copy: "Architecture shaped for Mediterranean sun."},
    {id: "privacy", label: "privacy", copy: "Boutique scale, intimate terraces."},
    {id: "legacy", label: "legacy", copy: "A lasting coastal address."},
] as const;

function IntroSection() {
    return (
        <section className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
            <p className="mx-auto max-w-3xl text-center font-dyeus-serif text-2xl leading-relaxed text-dyeus-ink md:text-4xl">
                DYEUS is a rare opportunity to own a piece of the Mediterranean — where one of Europe&apos;s last
                untouched coastlines remains preserved in its natural beauty.
            </p>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
                {pillars.map((pillar) => (
                    <div key={pillar.id} className="border-t border-dyeus-border pt-5">
                        <p className="font-dyeus-serif text-2xl italic text-dyeus-bronze md:text-3xl">{pillar.label}</p>
                        <p className="mt-3 font-dyeus-sans text-sm leading-relaxed text-dyeus-ink-muted">{pillar.copy}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default IntroSection;
