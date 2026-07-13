import {OpenProjectContentProps} from "@propertyManagementModule/clients/client/public/project/shared/openProjectShell.tsx";
import ProjectViewActions from "@propertyManagementModule/clients/client/public/project/shared/projectViewActions.tsx";
import OpenProjectFinancePriceChart from "@propertyManagementModule/clients/client/public/project/components/openProjectFinancePriceChart.tsx";
import {projectAssets} from "@propertyManagementModule/clients/client/public/project/projectAssets.ts";
import {PUBLIC_HEADING, PUBLIC_SUBTITLE, PUBLIC_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

function OpenProjectFinanceSection({project, resolveLanguageKey}: OpenProjectContentProps) {
    return (
        <div className="flex w-full flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,482px)_1fr] lg:gap-8">
            <div className="flex flex-col gap-2" data-node-id="475:1256">
                <h1 className={PUBLIC_TITLE} data-node-id="475:1257">
                    {project.name}
                </h1>
                {project.location && (
                    <p className={PUBLIC_SUBTITLE} data-node-id="475:1258">
                        {project.location}
                    </p>
                )}
            </div>

            <div
                className="flex flex-col overflow-hidden rounded-[5px] border border-pronix-border"
                data-node-id="475:1259"
            >
                <div className="flex flex-col gap-4 border-b border-pronix-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8 md:pt-8" data-node-id="475:1752">
                    <p className={PUBLIC_HEADING}>
                        {resolveLanguageKey("priceHistory")}
                    </p>
                    <div className="flex items-center gap-3">
                        <p className="font-aeonik-medium text-lg text-pronix-ink not-italic md:text-2xl">
                            {project.minSharePrice != null ? `€${project.minSharePrice.toLocaleString()}/m²` : "—"}
                        </p>
                        {project.projectedYieldPercent != null && (
                            <span
                                className="inline-flex items-center gap-1 rounded-[5px] px-3 py-2 font-aeonik-medium text-base not-italic md:text-lg"
                                style={{background: "rgba(31, 190, 106, 0.1)", color: "#1fbe6a"}}
                            >
                                +{project.projectedYieldPercent}%
                                <img alt="" aria-hidden className="size-5" src={projectAssets.arrowUp} />
                            </span>
                        )}
                    </div>
                </div>
                <div className="relative w-full p-4 md:p-8">
                    <OpenProjectFinancePriceChart
                        ariaLabel={String(resolveLanguageKey("chartAriaLabel"))}
                        formatTooltip={(label, scaleLabel) => {
                            const template = String(resolveLanguageKey("chartTooltipValue"));
                            return template.replace("{{label}}", label).replace("{{value}}", scaleLabel);
                        }}
                    />
                </div>
            </div>

            <div className="lg:col-span-2">
                <ProjectViewActions />
            </div>
        </div>
    );
}

export default OpenProjectFinanceSection;
