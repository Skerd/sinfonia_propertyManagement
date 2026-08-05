import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";

function LocationSection() {
    return (
        <section className="relative min-h-[70vh] overflow-hidden">
            <img src={dyeusAssets.coastline} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-dyeus-ink/35" />
            <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-[1440px] flex-col justify-end px-6 py-16 md:px-12 md:py-24">
                <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-white/80">Location</p>
                <h2 className="mt-4 max-w-2xl font-dyeus-serif text-4xl text-dyeus-white md:text-6xl">
                    Easy access to everything
                </h2>
                <p className="mt-4 max-w-xl font-dyeus-sans text-base leading-relaxed text-dyeus-white/85">
                    Nestled along an unspoiled stretch of coastline — close to clear waters, mountain light, and the
                    rhythm of Mediterranean life.
                </p>
            </div>
        </section>
    );
}

export default LocationSection;
