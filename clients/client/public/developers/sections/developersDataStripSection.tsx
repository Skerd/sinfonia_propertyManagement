import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

const STATS = [
    {key: "stat1", nodeId: "368:5040"},
    {key: "stat4", nodeId: "368:5046"},
    {key: "stat2", nodeId: "368:5042"},
    {key: "stat3", nodeId: "368:5044"},
] as const;

function splitStat(text: string): {value: string; label: string} {
    const match = text.match(/^([+\-]?\d+(?:\s*%)?)\s+(.+)$/);
    if (!match) {
        return {value: text, label: ""};
    }
    return {value: match[1], label: match[2]};
}

function DevelopersDataStripSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div className="grid w-full grid-cols-2" data-node-id="368:5039">
            {STATS.map((stat, index) => {
                const {value, label} = splitStat(resolveLanguageKey(stat.key));
                const isLeftCol = index % 2 === 0;
                const isTopRow = index < 2;

                return (
                    <div
                        key={stat.key}
                        className={`flex flex-col items-center justify-center px-3 py-6 text-center ${
                            isLeftCol ? "border-r border-pronix-border" : ""
                        } ${isTopRow ? "border-b border-pronix-border" : ""}`}
                    >
                        <p
                            className="font-aeonik-bold text-[32px] leading-[1.2] tracking-normal text-[#0247FE] not-italic"
                            data-node-id={stat.nodeId}
                        >
                            {value}
                        </p>
                        {label ? (
                            <p className="mt-1 font-aeonik-light text-[16px] leading-[1.2] tracking-normal text-pronix-ink not-italic">
                                {label}
                            </p>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

export default DevelopersDataStripSection;
