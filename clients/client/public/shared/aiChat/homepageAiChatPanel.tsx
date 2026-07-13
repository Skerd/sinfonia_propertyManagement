import {useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode} from "react";
import {useAiChat} from "@propertyManagementModule/clients/client/public/shared/aiChat/aiChatContext.tsx";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {PUBLIC_HEADING} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import AiOrbVisual from "@propertyManagementModule/clients/client/public/shared/sections/aiOrbVisual.tsx";

function WindowChromeButton({
    ariaLabel,
    onClick,
    children,
}: {
    ariaLabel: string;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            className="relative flex size-9 shrink-0 cursor-pointer items-center justify-center"
        >
            {children}
        </button>
    );
}

function HomepageAiChatPanel() {
    const {messages, close, sendMessage} = useAiChat();
    const [draft, setDraft] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasMessages = messages.length > 0;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages.length]);

    const handleSend = useCallback(() => {
        if (!draft.trim()) {
            return;
        }
        sendMessage(draft);
        setDraft("");
    }, [draft, sendMessage]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
            }
        },
        [handleSend],
    );

    return (
        <div
            className="isolate relative flex h-[min(70vh,28rem)] w-[min(calc(100vw-2rem),26rem)] flex-col overflow-hidden rounded-[5px]"
            data-node-id="49:1328"
            data-name="AI orb pressed"
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 backdrop-blur-[8px]"
                style={{background: "rgba(2, 71, 254, 0.75)"}}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#0247fe]/92" />
            <div className="relative z-10 flex min-h-0 flex-1 flex-col px-6 pb-6 pt-11">
                <div
                    className={`relative flex shrink-0 items-center justify-end gap-4 ${hasMessages ? "mb-4" : "mb-8"}`}
                    data-node-id="49:1331"
                >
                    <WindowChromeButton ariaLabel="Minimize" onClick={close}>
                        <div className="relative h-0 w-3.5 shrink-0">
                            <img alt="" aria-hidden className="absolute -top-0.5 block size-full max-w-none" src={figmaAssets.aiOrbLine} />
                        </div>
                    </WindowChromeButton>
                    <WindowChromeButton ariaLabel="Close" onClick={close}>
                        <div className="relative size-2.5 shrink-0">
                            <img alt="" aria-hidden className="absolute inset-[-8.33%] block size-full max-w-none" src={figmaAssets.aiOrbVector} />
                        </div>
                    </WindowChromeButton>
                </div>

                <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                    {hasMessages ? (
                        <div className="mb-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                            {messages.map((message) => (
                                <div key={message.id} className="flex w-full justify-end">
                                    <p className="max-w-[85%] rounded-[8px] bg-white/10 px-3 py-2 text-right font-aeonik-light text-sm leading-snug text-white">
                                        {message.text}
                                    </p>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        <div className="mb-4 flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-hidden" data-node-id="49:1335">
                            <div className="pointer-events-none size-20 shrink-0 overflow-hidden md:size-24">
                                <AiOrbVisual variant="hero" />
                            </div>
                            <p className={`max-w-[min(100%,17rem)] shrink-0 text-center ${PUBLIC_HEADING} leading-none text-white`}>
                                How can I help you today?
                            </p>
                        </div>
                    )}
                </div>

                <div className="relative shrink-0 rounded-[10px]" data-node-id="49:1342">
                    <div
                        className="relative flex items-center justify-between rounded-[10px] border border-white p-3.5"
                        data-node-id="49:1343"
                    >
                        <input
                            type="text"
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type something here..."
                            className="min-w-0 flex-1 bg-transparent font-aeonik-light text-base leading-6 text-white outline-none placeholder:text-white"
                        />
                        <div className="relative flex shrink-0 items-center gap-6">
                            <div className="relative flex shrink-0 items-center gap-3">
                                <img alt="Files" className="block size-[18px] shrink-0" src={figmaAssets.aiOrbFilesIcon} />
                                <img alt="Users" className="block size-[18px] shrink-0" src={figmaAssets.aiOrbUsersIcon} />
                            </div>
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={!draft.trim()}
                                className="relative flex size-7 shrink-0 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Send"
                            >
                                <img alt="" aria-hidden className="block size-[18px] max-w-none" src={figmaAssets.aiOrbSendIcon} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomepageAiChatPanel;
