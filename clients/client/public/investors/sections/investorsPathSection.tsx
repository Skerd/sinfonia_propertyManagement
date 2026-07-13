import {figmaNumberedStepLeftRatio} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {NumberedStepCardsSection} from "@propertyManagementModule/clients/client/public/shared/sections/numberedStepCardsSection.tsx";

const STEPS = [
    {num: "01", titleKey: "pathStep1Title", bodyKey: "pathStep1Body", nodeId: "357:4631", numberLeftPx: -68, titleLeftPx: 24},
    {num: "02", titleKey: "pathStep2Title", bodyKey: "pathStep2Body", nodeId: "357:4632", numberLeftPx: -67.75, titleLeftPx: 24.25},
    {num: "03", titleKey: "pathStep3Title", bodyKey: "pathStep3Body", nodeId: "357:4633", numberLeftPx: -67.5, titleLeftPx: 24.5},
    {num: "04", titleKey: "pathStep4Title", bodyKey: "pathStep4Body", nodeId: "357:4634", numberLeftPx: -68.25, titleLeftPx: 23.75},
] as const;

function InvestorsPathSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <NumberedStepCardsSection
            sectionNodeId="357:4704"
            titleNodeId="357:4628"
            rowNodeId="357:4630"
            title={resolveLanguageKey("pathTitle")}
            cards={STEPS.map((step) => ({
                nodeId: step.nodeId,
                number: step.num,
                numberLeftRatio: figmaNumberedStepLeftRatio(step.numberLeftPx),
                titleLeftRatio: figmaNumberedStepLeftRatio(step.titleLeftPx),
                title: resolveLanguageKey(step.titleKey),
                body: resolveLanguageKey(step.bodyKey),
            }))}
        />
    );
}

export default InvestorsPathSection;
