import {useAiChat} from "@propertyManagementModule/clients/client/public/shared/aiChat/aiChatContext.tsx";
import HomepageAiChatPanel from "@propertyManagementModule/clients/client/public/shared/aiChat/homepageAiChatPanel.tsx";
import {PUBLIC_LAYER_CHAT} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import AiOrbVisual from "@propertyManagementModule/clients/client/public/shared/sections/aiOrbVisual.tsx";

const PANEL_GAP = 12;

function PublicAiChat() {
    const {isOpen, open} = useAiChat();

    return (
        <div
            aria-live="polite"
            className="fixed bottom-4 right-4 flex flex-col items-end md:bottom-8 md:right-8"
            style={{gap: PANEL_GAP, zIndex: PUBLIC_LAYER_CHAT}}
        >
            {isOpen && <HomepageAiChatPanel />}
            {!isOpen && (
                <button
                    type="button"
                    /* Wrapped: `open` takes an optional context object, and React
                       would otherwise pass the MouseEvent into it. */
                    onClick={() => open()}
                    className="flex size-16 cursor-pointer items-center justify-center border-0 bg-transparent p-0 transition-transform duration-300 hover:scale-110 md:size-20"
                    data-node-id="37:143"
                    data-name="AI Orb"
                    aria-label="Open AI assistant"
                >
                    <AiOrbVisual variant="hero" className="size-full" clipped hideGlow />
                </button>
            )}
        </div>
    );
}

export default PublicAiChat;
