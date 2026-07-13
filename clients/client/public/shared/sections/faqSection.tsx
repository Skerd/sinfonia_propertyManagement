import {useState} from "react";
import {
    PUBLIC_CONTAINER,
    PUBLIC_SUBTITLE,
    PUBLIC_TITLE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

export type FaqItem = {
    qKey: string;
    aKey?: string;
    open?: boolean;
};

type FaqSectionProps = {
    items: readonly FaqItem[];
    titleKey: string;
    subtitleKey: string;
    plusIconSrc: {open: string; closed: string};
    resolveLanguageKey: (key: string) => string;
    nodeId?: string;
};

function FaqSection({
    items,
    titleKey,
    subtitleKey,
    plusIconSrc,
    resolveLanguageKey,
    nodeId,
}: FaqSectionProps) {
    const defaultOpenIndex = Math.max(
        0,
        items.findIndex((item) => item.open),
    );
    const [openIndex, setOpenIndex] = useState(defaultOpenIndex);

    function toggleItem(index: number) {
        setOpenIndex((current) => (current === index ? -1 : index));
    }

    return (
        <div className={`${PUBLIC_CONTAINER} flex w-full flex-col items-center gap-6 py-8 md:gap-8`} data-node-id={nodeId}>
            <div className="text-center text-pronix-ink not-italic">
                <h2 className={PUBLIC_TITLE}>{resolveLanguageKey(titleKey)}</h2>
                <p className={`mt-3 ${PUBLIC_SUBTITLE}`}>{resolveLanguageKey(subtitleKey)}</p>
            </div>
            <div className="flex w-full max-w-[1090px] flex-col gap-6 md:gap-8">
                {items.map((item, index) => {
                    const isOpen = openIndex === index;

                    return (
                        <div key={item.qKey} className="overflow-hidden rounded-[5px]">
                            <button
                                type="button"
                                onClick={() => toggleItem(index)}
                                aria-expanded={isOpen}
                                className={`flex w-full items-center justify-between gap-4 p-4 text-left md:p-6 ${
                                    isOpen ? "bg-pronix-blue" : "border border-pronix-border bg-white"
                                }`}
                            >
                                <p
                                    className={`font-aeonik-medium text-base not-italic md:text-xl lg:text-2xl leading-[1.2] ${
                                        isOpen ? "text-white" : "text-pronix-ink"
                                    }`}
                                >
                                    {resolveLanguageKey(item.qKey)}
                                </p>
                                <img
                                    alt=""
                                    aria-hidden
                                    className="size-6 shrink-0"
                                    src={isOpen ? plusIconSrc.open : plusIconSrc.closed}
                                />
                            </button>
                            {isOpen && item.aKey && (
                                <div className="border border-t-0 border-pronix-border bg-white p-4 md:p-6">
                                    <p className="font-aeonik-light text-base text-pronix-ink not-italic md:text-xl lg:text-2xl leading-[1.2]">
                                        {resolveLanguageKey(item.aKey)}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default FaqSection;
