import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {useDyeusT} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";

const HOME_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/home/index.tsx";

function FeaturesTickerSection() {
    const {t, tList} = useDyeusT(HOME_LANGUAGE_PATH);
    const items = tList("tickerItems");
    const row = [...items, ...items];

    return (
        <section className="overflow-hidden py-8 md:py-10" aria-label={t("tickerAria")}>
            <div className="dyeus-marquee flex w-max items-center gap-12">
                {row.map((item, index) => (
                    <div key={`${item}-${index}`} className="flex items-center gap-12">
                        <div className="size-10 shrink-0 overflow-hidden">
                            <img
                                src={dyeusAssets.mandala}
                                alt=""
                                className="relative left-[-36.85%] top-[-36.51%] size-[173.33%] max-w-none"
                            />
                        </div>
                        <p className="whitespace-nowrap font-dyeus-serif text-2xl font-bold uppercase leading-none text-dyeus-ink md:text-[32px]">
                            {item}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default FeaturesTickerSection;
