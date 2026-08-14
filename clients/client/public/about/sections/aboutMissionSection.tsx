import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {aboutAssets} from "@propertyManagementModule/clients/client/public/about/aboutAssets.ts";
import {FIGMA_ABOUT_MISSION} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";

const {logoWidth, logoHeight, logoColumnRatio, mutedColor} = FIGMA_ABOUT_MISSION;

function AboutMissionSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div className="@container relative w-full min-w-0" data-node-id="368:4989">
            <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,106fr)_minmax(0,435fr)_minmax(0,1077fr)] lg:items-start lg:gap-0">
                <img
                    alt=""
                    aria-hidden
                    className="w-full object-contain object-left lg:max-w-none"
                    style={{
                        aspectRatio: `${logoWidth} / ${logoHeight}`,
                        maxWidth: `min(100%, ${logoColumnRatio * 100}cqw)`,
                    }}
                    src={aboutAssets.aboutLogo}
                    data-node-id="368:5022"
                />
                <div aria-hidden className="hidden min-w-0 lg:block" />
                <p
                    className="min-w-0 font-aeonik-medium text-[32px] leading-[1.1] tracking-normal text-pronix-ink not-italic [word-break:break-word] lg:[font-size:min(3.94575cqw,4rem)]"
                    data-node-id="368:4989"
                >
                    {resolveLanguageKey("missionBodyPrimary")}
                    <span style={{color: mutedColor}}>{resolveLanguageKey("missionBodyMuted")}</span>
                </p>
            </div>
        </div>
    );
}

export default AboutMissionSection;
