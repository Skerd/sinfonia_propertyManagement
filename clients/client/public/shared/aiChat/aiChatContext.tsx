import {createContext, useCallback, useContext, useMemo, useState, type ReactNode} from "react";

type AiChatMessage = {
    id: string;
    text: string;
    sentAt: number;
};

type AiChatContextValue = {
    isOpen: boolean;
    messages: AiChatMessage[];
    open: () => void;
    close: () => void;
    toggle: () => void;
    sendMessage: (text: string) => void;
};

const AiChatContext = createContext<AiChatContextValue | null>(null);

function AiChatProvider({children}: {children: ReactNode}) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<AiChatMessage[]>([]);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    const sendMessage = useCallback((text: string) => {
        const trimmed = text.trim();
        if (!trimmed) {
            return;
        }
        setMessages((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                text: trimmed,
                sentAt: Date.now(),
            },
        ]);
    }, []);

    const value = useMemo(
        () => ({
            isOpen,
            messages,
            open,
            close,
            toggle,
            sendMessage,
        }),
        [isOpen, messages, open, close, toggle, sendMessage],
    );

    return <AiChatContext.Provider value={value}>{children}</AiChatContext.Provider>;
}

function useAiChat() {
    const context = useContext(AiChatContext);
    if (!context) {
        throw new Error("useAiChat must be used within AiChatProvider");
    }
    return context;
}

export type {AiChatMessage};
export {AiChatProvider, useAiChat};
