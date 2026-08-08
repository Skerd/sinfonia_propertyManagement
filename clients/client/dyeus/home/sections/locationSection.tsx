import {useMemo} from "react";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {useDyeusT} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusT.ts";

const HOME_LANGUAGE_PATH =
    "src/modules/propertyManagement/clients/client/dyeus/home/index.tsx";

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
        <section className="relative overflow-hidden">
            <div className="relative mx-auto max-w-[1728px] px-6 pb-10 pt-8 md:px-[60px]">
                <div className="mx-auto flex max-w-[1178px] flex-col items-center gap-[22px]">
                    <h2 className="text-center font-dyeus-serif text-[clamp(2.5rem,5vw,5rem)] font-bold leading-none text-dyeus-ink">
                        {t("locationTitle")}
                    </h2>
                    <div className="flex w-full flex-col gap-8 md:flex-row md:justify-between md:gap-16">
                        {accessColumns.map((column) => (
                            <div key={column[0]} className="flex flex-col gap-3">
                                {column.map((item) => (
                                    <div key={item} className="flex items-start gap-2.5">
                                        <img
                                            src={dyeusAssets.iconCheck}
                                            alt=""
                                            className="mt-0.5 size-7 shrink-0"
                                        />
                                        <p className="font-dyeus-serif text-lg leading-[1.1] text-dyeus-ink md:text-2xl">
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden md:h-[999px]">
                <img
                    src={dyeusAssets.locationCoast}
                    alt=""
                    className="absolute inset-0 size-full object-cover object-[center_30%]"
                />
            </div>
        </section>
    );
}

export default LocationSection;
