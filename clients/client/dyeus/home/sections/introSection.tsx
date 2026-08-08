import {useMemo} from "react";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {useDyeusT} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";

const HOME_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/home/index.tsx";

const PILLAR_KEYS = [
    {id: "sea", labelKey: "pillarSeaLabel", copyKey: "pillarSeaCopy"},
    {id: "light", labelKey: "pillarLightLabel", copyKey: "pillarLightCopy"},
    {id: "privacy", labelKey: "pillarPrivacyLabel", copyKey: "pillarPrivacyCopy"},
    {id: "legacy", labelKey: "pillarLegacyLabel", copyKey: "pillarLegacyCopy"},
] as const;

function IntroSection() {
    const {t} = useDyeusT(HOME_LANGUAGE_PATH);

    const pillars = useMemo(
        () =>
            PILLAR_KEYS.map((pillar) => ({
                id: pillar.id,
                label: t(pillar.labelKey),
                copy: t(pillar.copyKey),
            })),
        [t],
    );

    return (
        <section className="mx-auto max-w-[1728px] px-6 pb-16 pt-16 md:px-[60px] md:pb-20 md:pt-[60px]">
            <div className="flex items-start justify-between gap-8">
                <p className="max-w-[1295px] font-dyeus-serif text-[clamp(1.75rem,4vw,4rem)] font-bold leading-none text-dyeus-ink">
                    {t("introLead")}
                </p>
                <div className="hidden size-[120px] shrink-0 overflow-hidden md:block">
                    <img
                        src={dyeusAssets.mandala}
                        alt=""
                        className="relative left-[-36.85%] top-[-36.51%] size-[173.33%] max-w-none"
                    />
                </div>
            </div>

            <div className="mt-12 grid gap-0 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
                {pillars.map((pillar, index) => (
                    <div
                        key={pillar.id}
                        className="relative flex min-h-[280px] flex-col justify-between border-t border-dyeus-border p-5 lg:min-h-[404px] lg:border-t-0 lg:border-l"
                        style={index === 0 ? {borderLeftWidth: 0} : undefined}
                    >
                        {index > 0 && (
                            <img
                                src={dyeusAssets.dividerPillar}
                                alt=""
                                className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-px lg:block"
                            />
                        )}
                        <p className="font-dyeus-serif text-base leading-[1.2] text-dyeus-ink md:text-xl">
                            {pillar.copy}
                        </p>
                        <p className="mt-10 font-dyeus-serif text-[clamp(2.5rem,4vw,4rem)] font-extrabold lowercase leading-none text-dyeus-ink">
                            {pillar.label}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default IntroSection;
