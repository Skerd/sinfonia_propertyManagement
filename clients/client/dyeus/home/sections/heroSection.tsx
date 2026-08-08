import {useEffect, useState} from "react";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {
    useDyeusSocialLinks,
} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusSocialLinks.ts";
import {useDyeusT} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";

const HOME_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/home/index.tsx";

const heroLinkClassName =
    "inline-flex items-center font-dyeus-serif text-xl leading-[1.2] text-dyeus-cream underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color,opacity] duration-300 hover:text-dyeus-bronze hover:decoration-dyeus-bronze";

const heroLogoLinkClassName =
    "inline-flex size-6 items-center justify-center opacity-90 transition-opacity duration-300 hover:opacity-100";

function HeroSection() {
    const {t} = useDyeusT(HOME_LANGUAGE_PATH);
    const {socialLinks} = useDyeusSocialLinks();
    const [logoFailed, setLogoFailed] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setLogoFailed({});
    }, [socialLinks]);

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
                {t("heroTitleLine1")}
                <br />
                {t("heroTitleLine2")}
            </h1>

            <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-8 px-6 pb-8 md:inset-x-[60px] md:bottom-[5.5%] md:flex-row md:items-end md:justify-between md:gap-12 md:px-0 md:pb-0">
                {socialLinks.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-4 md:gap-6">
                        <p className="font-dyeus-serif text-lg font-bold text-dyeus-cream md:text-2xl">
                            {t("followDyeus")}
                        </p>
                        <img
                            src={dyeusAssets.lineFollow}
                            alt=""
                            className="hidden h-px w-[50px] rotate-180 opacity-80 md:block"
                        />
                        <div className="flex flex-wrap items-center gap-6 md:gap-8">
                            {socialLinks.map((social) => {
                                const key = `${social.name}-${social.link}`;
                                const showLogo = Boolean(social.logo) && !logoFailed[key];
                                return (
                                    <a
                                        key={key}
                                        href={social.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.name}
                                        className={showLogo ? heroLogoLinkClassName : heroLinkClassName}
                                    >
                                        {showLogo ? (
                                            <img
                                                src={social.logo}
                                                alt=""
                                                className="size-6 object-contain"
                                                onError={() =>
                                                    setLogoFailed((prev) => ({...prev, [key]: true}))
                                                }
                                            />
                                        ) : (
                                            <span>{social.name}</span>
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                ) : null}

                <p
                    className={`max-w-[534px] font-dyeus-serif text-xl leading-[1.2] text-dyeus-cream md:text-[32px] ${
                        socialLinks.length === 0 ? "md:ml-auto" : ""
                    }`}
                >
                    {t("heroDescription")}
                </p>
            </div>
        </section>
    );
}

export default HeroSection;
