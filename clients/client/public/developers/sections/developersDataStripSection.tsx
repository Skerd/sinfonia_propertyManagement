import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {PUBLIC_HEADING} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

const STATS = [
    {key: "stat1", nodeId: "368:5040"},
    {key: "stat2", nodeId: "368:5042"},
    {key: "stat3", nodeId: "368:5044"},
    {key: "stat4", nodeId: "368:5046"},
] as const;

function DevelopersDataStripSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div className="flex w-full flex-col gap-6 md:gap-8" data-node-id="368:5039">
            {STATS.map((stat, index) => (
                <div
                    key={stat.key}
                    className={`flex items-center ${index > 0 ? "border-t border-pronix-border pt-6 md:pt-8" : ""}`}
                >
                    <p className={PUBLIC_HEADING} data-node-id={stat.nodeId}>
                        {resolveLanguageKey(stat.key)}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default DevelopersDataStripSection;
