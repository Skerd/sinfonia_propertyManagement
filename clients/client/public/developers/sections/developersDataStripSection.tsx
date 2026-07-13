import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {PUBLIC_GRID_KPI, PUBLIC_HEADING} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

const STATS = [
    {key: "stat1", nodeId: "368:5040"},
    {key: "stat2", nodeId: "368:5042"},
    {key: "stat3", nodeId: "368:5044"},
    {key: "stat4", nodeId: "368:5046"},
] as const;

function DevelopersDataStripSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div className={PUBLIC_GRID_KPI} data-node-id="368:5039">
            {STATS.map((stat) => (
                <div
                    key={stat.key}
                    className="flex items-center border-t border-pronix-border pt-6 first:border-t-0 first:pt-0 sm:border-t-0 sm:border-l sm:pl-8 sm:first:border-l-0 sm:first:pl-0 lg:pt-0"
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
