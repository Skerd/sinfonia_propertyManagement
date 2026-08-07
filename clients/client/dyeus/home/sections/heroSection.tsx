import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";

const socials = [
    {src: dyeusAssets.iconFacebook, label: "Facebook", href: "#"},
    {src: dyeusAssets.iconInstagram, label: "Instagram", href: "#"},
    {src: dyeusAssets.iconPinterest, label: "Pinterest", href: "#"},
] as const;

function HeroSection() {
    return (
        <section className="relative h-svh w-full overflow-hidden">
            <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster={dyeusAssets.heroBg}
                aria-hidden
                className="pointer-events-none absolute inset-0 size-full object-cover"
                src={dyeusAssets.heroVideo}
            />

            <DyeusHeader variant="hero" />

            <h1 className="absolute left-6 top-[22%] z-10 max-w-[18ch] font-dyeus-serif text-[clamp(2.75rem,7vw,7.5rem)] font-bold leading-none text-dyeus-cream md:left-[53px] md:top-[22%] md:max-w-[1081px]">
                Luxury living.
                <br />
                Smart Investment
            </h1>

            <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-8 px-6 pb-8 md:inset-x-[60px] md:bottom-[5.5%] md:flex-row md:items-end md:justify-between md:gap-12 md:px-0 md:pb-0">
                <div className="flex flex-wrap items-center gap-4 md:gap-6">
                    <p className="font-dyeus-serif text-lg font-bold text-dyeus-cream md:text-2xl">
                        Follow Dyeus
                    </p>
                    <img
                        src={dyeusAssets.lineFollow}
                        alt=""
                        className="hidden h-px w-[50px] rotate-180 opacity-80 md:block"
                    />
                    <div className="flex items-center gap-6 opacity-60 md:gap-8">
                        {socials.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                aria-label={social.label}
                                className="size-6"
                            >
                                <img
                                    src={social.src}
                                    alt=""
                                    className="size-6 brightness-0 invert"
                                />
                            </a>
                        ))}
                    </div>
                </div>

                <p className="max-w-[534px] font-dyeus-serif text-xl leading-[1.2] text-dyeus-cream md:text-[32px]">
                    A private collection of residences, villas, and suites between the Ionian Sea and
                    the mountains of Southern Albania.
                </p>
            </div>
        </section>
    );
}

export default HeroSection;
