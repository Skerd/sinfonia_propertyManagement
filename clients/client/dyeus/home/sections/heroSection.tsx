import {Link} from "react-router-dom";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";

function HeroSection() {
    return (
        <section className="relative min-h-[100svh] overflow-hidden">
            <img
                src={dyeusAssets.hero}
                alt=""
                className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/25" />
            <DyeusHeader variant="hero" />
            <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-end px-6 pb-16 pt-28 md:px-12 md:pb-24">
                <p className="mb-4 font-dyeus-sans text-xs uppercase tracking-[0.28em] text-dyeus-white/80">
                    Dyeus Residence
                </p>
                <h1 className="max-w-4xl font-dyeus-serif text-5xl leading-[1.05] text-dyeus-white md:text-7xl lg:text-8xl">
                    Luxury living.
                    <br />
                    Smart Investment.
                </h1>
                <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                        to="/residences"
                        className="bg-dyeus-white px-6 py-3 font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-ink transition hover:bg-dyeus-sand"
                    >
                        Explore residences
                    </Link>
                    <Link
                        to="/contact"
                        className="border border-dyeus-white/70 px-6 py-3 font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-white transition hover:bg-dyeus-white/10"
                    >
                        Enquire
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
