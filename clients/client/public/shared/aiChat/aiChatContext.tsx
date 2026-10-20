import {useCallback, useMemo, type ReactNode} from "react";
import {
    PublicChatProvider,
    usePublicChat,
    type PublicChatMessage,
    type PublicChatSessionContext,
} from "@coreModule/helpers/chat/publicChat/publicChatContext.tsx";
import {identify as identifyRequest} from "@propertyManagementModule/clients/client/public/shared/aiChat/publicChatClient.ts";

/**
 * Pick up what the visitor is looking at from the URL.
 *
 * The property and project pages already carry `projectId` / `unitId` as search
 * params, so the widget can open already knowing the context without every page
 * having to pass it in. An explicit `open({unit})` still wins.
 */
function contextFromUrl(): PublicChatSessionContext {
    if (typeof window === "undefined") {
        return {};
    }
    try {
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get("projectId") ?? undefined;
        const unitId = params.get("unitId") ?? undefined;
        // The server validates these as ObjectIds; send only plausible values so
        // a junk query string cannot fail the whole session bootstrap.
        const isObjectId = (value?: string): value is string => !!value && /^[a-f\d]{24}$/i.test(value);
        return {
            ...(isObjectId(projectId) ? {project: projectId} : {}),
            ...(isObjectId(unitId) ? {unit: unitId} : {}),
        };
    }
    catch {
        return {};
    }
}

function AiChatProvider({children}: {children: ReactNode}) {
    return <PublicChatProvider sessionContext={contextFromUrl}>{children}</PublicChatProvider>;
}

/** The core chat state plus propertyManagement's lead capture. */
function useAiChat() {
    const chat = usePublicChat();
    const {markIdentified} = chat;

    /** Leave contact details; becomes a CRM lead. */
    const identify = useCallback(
        async (details: {
            name: string;
            email: string;
            phone: string;
            note?: string;
            budget?: number;
            budgetCurrency?: string;
        }) => {
            try {
                await identifyRequest(details);
                markIdentified();
                return true;
            }
            catch {
                return false;
            }
        },
        [markIdentified],
    );

    return useMemo(() => ({...chat, identify}), [chat, identify]);
}

export type {PublicChatMessage as AiChatMessage};
export {AiChatProvider, useAiChat};
