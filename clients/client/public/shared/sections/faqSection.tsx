import {useState} from "react";
import {
    PUBLIC_CONTAINER,
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
        <div className={`${PUBLIC_CONTAINER} flex w-full flex-col items-start gap-6 pt-16 pb-8 md:items-center md:gap-8 md:py-8`} data-node-id={nodeId}>
            <div className="w-full text-left text-pronix-ink not-italic md:text-center">
                <h2 className="cursor-default font-aeonik-medium text-[40px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-5xl lg:text-[56px]">
                    {resolveLanguageKey(titleKey)}
                </h2>
                <p className="mt-3 cursor-default font-aeonik-light text-[18px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-2xl md:leading-[1.4] lg:text-[24px]">
                    {resolveLanguageKey(subtitleKey)}
                </p>
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
                                className={`flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left transition duration-200 md:p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pronix-ink/30 focus-visible:ring-offset-2 ${
                                    isOpen
                                        ? "bg-pronix-blue hover:bg-pronix-blue/90"
                                        : "border border-pronix-border bg-white hover:border-[rgba(24,24,24,0.35)] hover:bg-pronix-ink/[0.03] hover:shadow-sm"
                                }`}
                            >
                                <p
                                    className={`font-aeonik-medium text-[20px] not-italic md:text-xl lg:text-2xl leading-[1.2] tracking-normal ${
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
                                    <p className="font-aeonik-light text-[18px] leading-[1.2] tracking-normal text-pronix-ink not-italic md:text-xl lg:text-2xl">
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
