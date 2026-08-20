import {useMemo} from "react";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {useDyeusT} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";

const HOME_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/home/index.tsx";

const CREAM_FADE =
    "linear-gradient(180deg, #f2eee6 0%, #f2eee6 42%, rgba(242,238,230,0.88) 62%, rgba(242,238,230,0.4) 82%, rgba(242,238,230,0) 100%)";

function chunkPairs(items: string[]): string[][] {
    const columns: string[][] = [];
    for (let i = 0; i < items.length; i += 2) {
        columns.push(items.slice(i, i + 2));
    }
    return columns;
}

function LocationSection() {
    const {t, tList} = useDyeusT(HOME_LANGUAGE_PATH);

    const accessColumns = useMemo(() => chunkPairs(tList("locationAccess")), [tList]);

    return (
        <section className="relative w-full overflow-hidden">
            <img
                src={dyeusAssets.locationCoast}
                alt=""
                className="absolute inset-0 size-full object-cover object-[center_top]"
            />
            <div className="relative z-10 min-h-[85svh] md:min-h-[999px]">
                <div className="relative">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 -bottom-24 z-0 md:-bottom-40"
                        style={{backgroundImage: CREAM_FADE}}
                    />
                    <div className="relative z-10 flex justify-center px-6 pb-4 pt-8 md:px-[60px] md:pb-6 md:pt-10">
                        <div className="flex w-full max-w-[1178px] flex-col items-center gap-4 md:gap-[22px]">
                            <h2 className="text-center font-dyeus-serif text-[clamp(1.75rem,8vw,5rem)] font-bold leading-none text-dyeus-ink">
                                {t("locationTitle")}
                            </h2>
                            <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:justify-between sm:gap-8 md:gap-16">
                                {accessColumns.map((column) => (
                                    <div key={column[0]} className="flex flex-col gap-2.5 md:gap-3">
                                        {column.map((item) => (
                                            <div key={item} className="flex items-start gap-2.5">
                                                <img
                                                    src={dyeusAssets.iconCheck}
                                                    alt=""
                                                    className="mt-0.5 size-6 shrink-0 md:size-7"
                                                />
                                                <p className="font-dyeus-serif text-base leading-[1.15] text-dyeus-ink md:text-2xl">
                                                    {item}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default LocationSection;
