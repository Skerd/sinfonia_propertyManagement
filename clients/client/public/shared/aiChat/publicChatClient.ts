/**
 * Transport for the public-website visitor chat.
 *
 * Deliberately does NOT reuse the shared `apiClient`:
 *  - that instance attaches the logged-in panel user's `x-auth-token` to every
 *    request, which has no business going to an anonymous public endpoint; and
 *  - its response interceptor treats `no_token` / `token_verification_failed` as
 *    an expired *session* and dispatches `markSessionExpired()`. The visitor
 *    endpoints legitimately return those codes when a visitor token is missing
 *    or stale, which would pop a session-expired dialog on a public marketing
 *    page.
 *
 * The visitor token lives in localStorage so a returning visitor resumes the
 * same conversation; it is scoped server-side to exactly one chat channel.
 */

import axios from "axios";
import type {
    PublicChatMessageType,
    PublicChatStatusType,
} from "armonia/src/modules/core/api/user/public/publicChat/publicChat.types";
import type {
    StartPublicChatSessionFormResponseType,
} from "armonia/src/modules/core/api/user/public/publicChat/startPublicChatSession/startPublicChatSession.form.response.type";
import type {
    PublicChatMessagesFormResponseType,
} from "armonia/src/modules/core/api/user/public/publicChat/publicChatMessages/publicChatMessages.form.response.type";
import type {
    SendPublicChatMessageFormResponseType,
} from "armonia/src/modules/core/api/user/public/publicChat/sendPublicChatMessage/sendPublicChatMessage.form.response.type";
import type {
    RequestPublicChatHandoffFormResponseType,
} from "armonia/src/modules/core/api/user/public/publicChat/requestPublicChatHandoff/requestPublicChatHandoff.form.response.type";
import type {
    PublicChatIdentifyFormResponseType,
} from "armonia/src/modules/propertyManagement/api/realEstate/public/publicChatIdentify/publicChatIdentify.form.response.type";
import type {
    PublicCurrenciesResponseType,
    PublicCurrencyItem,
} from "armonia/src/modules/core/api/finance/public/currencies/publicCurrencies.response.type";

const BASE_PATH = "/api/public/chat";
/** Lead capture lives in propertyManagement — core does not own `Lead`. */
const IDENTIFY_PATH = "/api/realEstate/publicChat";
const CURRENCIES_PATH = "/api/finance/public/currencies";
const TOKEN_STORAGE_KEY = "arpeggio.publicChat.token";
const DEVICE_ID_STORAGE_KEY = "arpeggio.publicChat.deviceId";
const VISITOR_TOKEN_HEADER = "x-visitor-token";

export type {PublicCurrencyItem};

const publicChatClient = axios.create();

// -------------------------------------------------------------------------
// Token persistence
// -------------------------------------------------------------------------

export function getVisitorToken(): string | null {
    try {
        return window.localStorage.getItem(TOKEN_STORAGE_KEY);
    }
    catch {
        // Private browsing / storage disabled: the chat still works, it just
        // cannot be resumed after a reload.
        return null;
    }
}

export function setVisitorToken(token: string): void {
    try {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
    catch {
        /* non-fatal */
    }
}

export function clearVisitorToken(): void {
    try {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    catch {
        /* non-fatal */
    }
}

/**
 * A stable per-browser device id.
 *
 * REQUIRED on every request: maestro's global request validator rejects any call
 * without `x-device-id` with a 400 before it reaches the route. An anonymous
 * visitor has no account to derive one from, so we mint and persist our own
 * under a separate key from the panel's — the two apps must not share identity.
 */
function getPublicDeviceId(): string {
    try {
        const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
        if (existing) {
            return existing;
        }
        const generated = crypto.randomUUID();
        window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, generated);
        return generated;
    }
    catch {
        // Storage blocked (private mode): a per-load id still satisfies the
        // validator, it just will not be stable across reloads.
        return crypto.randomUUID();
    }
}

function authHeaders(languageCode?: string): Record<string, string> {
    const headers: Record<string, string> = {
        "x-device-id": getPublicDeviceId(),
    };
    const token = getVisitorToken();
    if (token) {
        headers[VISITOR_TOKEN_HEADER] = token;
    }
    if (languageCode) {
        headers["language"] = languageCode;
    }
    return headers;
}

// -------------------------------------------------------------------------
// Calls
// -------------------------------------------------------------------------

export type StartSessionInput = {
    languageCode?: string;
    entryUrl?: string;
    referrer?: string;
    projectId?: string;
    unitId?: string;
};

/**
 * Open or resume a conversation. Sends any stored token so the server can
 * resume; the server mints a fresh one when it cannot, which we then persist.
 */
export async function startSession(
    input: StartSessionInput = {},
): Promise<StartPublicChatSessionFormResponseType> {
    const {languageCode, ...context} = input;
    const {data} = await publicChatClient.post<StartPublicChatSessionFormResponseType>(
        `${BASE_PATH}/session`,
        {
            ...context,
            visitorToken: getVisitorToken() ?? undefined,
        },
        {headers: authHeaders(languageCode)},
    );
    if (data?.token) {
        setVisitorToken(data.token);
    }
    return data;
}

/** Fetch messages, optionally only those newer than `since` (the polling path). */
export async function fetchMessages(params: {
    since?: string;
    limit?: number;
    languageCode?: string;
}): Promise<PublicChatMessagesFormResponseType> {
    const {since, limit, languageCode} = params;
    const {data} = await publicChatClient.post<PublicChatMessagesFormResponseType>(
        `${BASE_PATH}/messages`,
        {since, limit},
        {headers: authHeaders(languageCode)},
    );
    return data;
}

export async function sendMessage(params: {
    text: string;
    languageCode?: string;
}): Promise<SendPublicChatMessageFormResponseType> {
    const {text, languageCode} = params;
    const {data} = await publicChatClient.put<SendPublicChatMessageFormResponseType>(
        `${BASE_PATH}/messages`,
        {text},
        {headers: authHeaders(languageCode)},
    );
    return data;
}

/** Ask for a human. Returns false when the chat was already escalated. */
export async function requestHandoff(params: {
    note?: string;
    languageCode?: string;
}): Promise<RequestPublicChatHandoffFormResponseType> {
    const {note, languageCode} = params;
    const {data} = await publicChatClient.post<RequestPublicChatHandoffFormResponseType>(
        `${BASE_PATH}/handoff`,
        {note},
        {headers: authHeaders(languageCode)},
    );
    return data;
}

/**
 * Leave contact details. Note this hits the propertyManagement route, not the
 * core chat one — the details become a CRM lead, which is a PM concept.
 */
export async function identify(params: {
    name: string;
    email: string;
    phone: string;
    note?: string;
    budget?: number;
    budgetCurrency?: string;
    languageCode?: string;
}): Promise<PublicChatIdentifyFormResponseType> {
    const {languageCode, ...body} = params;
    const {data} = await publicChatClient.post<PublicChatIdentifyFormResponseType>(
        `${IDENTIFY_PATH}/identify`,
        body,
        {headers: authHeaders(languageCode)},
    );
    return data;
}

/** Company currencies for the public identify / lead form budget select. */
export async function fetchPublicCurrencies(
    languageCode?: string,
): Promise<PublicCurrencyItem[]> {
    const {data} = await publicChatClient.get<PublicCurrenciesResponseType>(
        CURRENCIES_PATH,
        {headers: authHeaders(languageCode)},
    );
    return data.data ?? [];
}

/**
 * Right-to-erasure: destroy the conversation and the anonymous identity behind
 * it. Distinct from {@link closeSession}, which keeps the transcript.
 */
export async function eraseConversation(languageCode?: string): Promise<void> {
    await publicChatClient.delete(BASE_PATH, {headers: authHeaders(languageCode)});
    clearVisitorToken();
}

export async function closeSession(languageCode?: string): Promise<void> {
    await publicChatClient.post(
        `${BASE_PATH}/close`,
        {},
        {headers: authHeaders(languageCode)},
    );
    clearVisitorToken();
}

export type {PublicChatMessageType, PublicChatStatusType};
