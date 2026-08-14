import {useCallback, useEffect, useRef, useState, type ComponentType, type KeyboardEvent, type ReactNode} from "react";
import {cn} from "@coreModule/components/lib/utils.ts";
import withLanguage, {type WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {useAiChat, type AiChatMessage} from "@propertyManagementModule/clients/client/public/shared/aiChat/aiChatContext.tsx";
import {
    fetchPublicCurrencies,
    type PublicCurrencyItem,
} from "@propertyManagementModule/clients/client/public/shared/aiChat/publicChatClient.ts";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import AiOrbVisual from "@propertyManagementModule/clients/client/public/shared/sections/aiOrbVisual.tsx";
import {PUBLIC_CHAT_MAX_MESSAGE_LENGTH} from "armonia/src/modules/core/api/user/public/publicChat/sendPublicChatMessage/sendPublicChatMessage.form.validator";

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
            className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10"
        >
            {children}
        </button>
    );
}

/** One chat bubble. The visitor speaks on the right; bot and agents on the left. */
function ChatBubble({message}: {message: AiChatMessage}) {
    const isVisitor = message.author === "visitor";

    return (
        <div className={`flex w-full flex-col ${isVisitor ? "items-end" : "items-start"}`}>
            {message.author === "agent" && message.authorName ? (
                <span className="mb-1 px-1 font-aeonik-light text-xs text-white/70">
                    {message.authorName}
                </span>
            ) : null}
            <p
                className={[
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 font-aeonik-light text-sm leading-relaxed text-white",
                    isVisitor ? "bg-white/15 text-left" : "bg-white/20 text-left",
                    message.pending ? "opacity-60" : "",
                    message.failed ? "border border-red-300/70" : "",
                ].filter(Boolean).join(" ")}
            >
                {message.text}
            </p>
            {message.failed ? (
                <span className="mt-1 px-1 font-aeonik-light text-xs text-red-200">
                    Not delivered. Please try again.
                </span>
            ) : null}
        </div>
    );
}

/** Three-dot "someone is composing a reply" indicator. */
function ThinkingIndicator({label}: {label: string}) {
    return (
        <div className="flex w-full justify-start" aria-live="polite" aria-label={label}>
            <span className="flex items-center gap-1.5 rounded-2xl bg-white/20 px-3.5 py-3">
                {[0, 150, 300].map((delay) => (
                    <span
                        key={delay}
                        className="size-1.5 animate-pulse rounded-full bg-white/80"
                        style={{animationDelay: `${delay}ms`}}
                    />
                ))}
            </span>
        </div>
    );
}

type IdentifyFieldKey = "name" | "email" | "phone" | "budget";
type IdentifyFieldErrors = Partial<Record<IdentifyFieldKey, string>>;
type IdentifyFormValues = {
    name: string;
    email: string;
    phone: string;
    note?: string;
    budget?: number;
    budgetCurrency?: string;
};

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateIdentifyForm(
    values: IdentifyFormValues,
    resolveLanguageKey: WithLanguageType["resolveLanguageKey"],
): IdentifyFieldErrors {
    const errors: IdentifyFieldErrors = {};
    if (!values.name.trim()) errors.name = String(resolveLanguageKey("nameRequired"));
    if (!values.email.trim()) {
        errors.email = String(resolveLanguageKey("emailRequired"));
    } else if (!isValidEmail(values.email.trim())) {
        errors.email = String(resolveLanguageKey("emailInvalid"));
    }
    if (!values.phone.trim()) errors.phone = String(resolveLanguageKey("numberRequired"));
    if (values.budget != null && (!Number.isFinite(values.budget) || values.budget < 0)) {
        errors.budget = String(resolveLanguageKey("budgetInvalid"));
    }
    return errors;
}

function IdentifyFieldError({message}: {message?: string}) {
    if (!message) return null;
    return (
        <p role="alert" className="mt-1 font-aeonik-medium text-xs leading-[1.3] text-red-200">
            {message}
        </p>
    );
}

type IdentifyOutcome = "success" | "failure";

/** Payment-style animated mark that replaces the identify form after submit. */
function IdentifyOutcomeFeedback({
    outcome,
    onContinue,
    resolveLanguageKey,
}: {
    outcome: IdentifyOutcome;
    onContinue: () => void;
} & Pick<WithLanguageType, "resolveLanguageKey">) {
    const isSuccess = outcome === "success";
    const stroke = isSuccess ? "#4ade80" : "#f87171";

    return (
        <div
            className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-hidden rounded-xl bg-white/10 px-4 py-6"
            role="status"
            aria-live="polite"
        >
            <svg
                className="public-chat-outcome-mark size-[5.5rem] shrink-0"
                viewBox="0 0 52 52"
                aria-hidden="true"
            >
                <circle
                    className="public-chat-outcome-circle"
                    cx="26"
                    cy="26"
                    r="24"
                    fill="none"
                    stroke={stroke}
                    strokeWidth="2.5"
                />
                {isSuccess ? (
                    <path
                        className="public-chat-outcome-path"
                        fill="none"
                        stroke={stroke}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.5 27.2l7.2 7.2 15.8-16.4"
                    />
                ) : (
                    <>
                        <path
                            className="public-chat-outcome-path"
                            fill="none"
                            stroke={stroke}
                            strokeWidth="3"
                            strokeLinecap="round"
                            d="M18 18l16 16"
                        />
                        <path
                            className="public-chat-outcome-path"
                            fill="none"
                            stroke={stroke}
                            strokeWidth="3"
                            strokeLinecap="round"
                            d="M34 18L18 34"
                            style={{animationDelay: "0.62s"}}
                        />
                    </>
                )}
            </svg>
            <div className="public-chat-outcome-copy flex flex-col items-center gap-4 text-center">
                <div className="flex flex-col gap-1.5">
                    <p className="font-aeonik-medium text-base text-white">
                        {String(resolveLanguageKey(isSuccess ? "formSuccessTitle" : "formFailureTitle"))}
                    </p>
                    <p className="max-w-[16rem] font-aeonik-light text-sm leading-relaxed text-white/85">
                        {String(resolveLanguageKey(isSuccess ? "formSuccessBody" : "formFailureBody"))}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onContinue}
                    className="cursor-pointer rounded-lg bg-white px-4 py-2 font-aeonik-medium text-sm text-[#0247fe]"
                >
                    {String(resolveLanguageKey("continueToChat"))}
                </button>
            </div>
        </div>
    );
}

/**
 * Inline contact-details form. Shown when the tenant asks for identification, or
 * once the visitor has escalated to a human — at that point leaving details is
 * the difference between a conversation and a lead.
 *
 * Name / email / phone are required; budget, currency, and notes are optional.
 * After submit, the form swaps for a success / failure mark until the visitor
 * continues back to chat.
 */
function IdentifyFormInner({
    onSubmit,
    onDismiss,
    resolveLanguageKey,
}: {
    onSubmit: (details: IdentifyFormValues) => Promise<boolean>;
    onDismiss: () => void;
} & Pick<WithLanguageType, "resolveLanguageKey">) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [budget, setBudget] = useState("");
    const [budgetCurrency, setBudgetCurrency] = useState("");
    const [notes, setNotes] = useState("");
    const [currencies, setCurrencies] = useState<PublicCurrencyItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<IdentifyFieldErrors>({});
    const [outcome, setOutcome] = useState<IdentifyOutcome | null>(null);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const rows = await fetchPublicCurrencies();
                if (!cancelled) setCurrencies(rows);
            }
            catch {
                if (!cancelled) setCurrencies([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const clearFieldError = (key: IdentifyFieldKey) => {
        setFieldErrors((prev) => {
            if (!prev[key]) return prev;
            const next = {...prev};
            delete next[key];
            return next;
        });
    };

    const handleSubmit = async () => {
        if (isSaving) return;
        const trimmedBudget = budget.trim();
        const parsedBudget = trimmedBudget === "" ? undefined : Number(trimmedBudget);
        const values: IdentifyFormValues = {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            ...(notes.trim() ? {note: notes.trim()} : {}),
            ...(parsedBudget != null && Number.isFinite(parsedBudget) ? {budget: parsedBudget} : {}),
            ...(budgetCurrency ? {budgetCurrency} : {}),
        };
        // Preserve a typed-but-invalid budget so validation can flag it.
        if (trimmedBudget !== "" && (parsedBudget == null || !Number.isFinite(parsedBudget))) {
            values.budget = Number.NaN;
        }
        const errors = validateIdentifyForm(values, resolveLanguageKey);
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;
        setIsSaving(true);
        const ok = await onSubmit({
            ...values,
            budget: Number.isFinite(values.budget) ? values.budget : undefined,
        });
        setIsSaving(false);
        setOutcome(ok ? "success" : "failure");
    };

    if (outcome) {
        return (
            <IdentifyOutcomeFeedback
                outcome={outcome}
                onContinue={onDismiss}
                resolveLanguageKey={resolveLanguageKey}
            />
        );
    }

    const fieldClass =
        "w-full rounded-lg border bg-white/5 px-3 py-2 font-aeonik-light " +
        "text-sm text-white outline-none placeholder:text-white/55 focus:border-white/70";

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white/10">
            <div
                className={cn(
                    "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3.5",
                    "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.45)_rgba(255,255,255,0.12)]",
                    "[&::-webkit-scrollbar]:w-1.5",
                    "[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/10",
                    "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/45",
                )}
            >
                <p className="shrink-0 font-aeonik-light text-xs leading-relaxed text-white/90">
                    {String(resolveLanguageKey("formIntro"))}
                </p>
                <div className="min-w-0">
                    <input
                        className={cn(fieldClass, fieldErrors.name ? "border-red-300" : "border-white/40")}
                        name="name"
                        placeholder={String(resolveLanguageKey("namePlaceholder"))}
                        value={name}
                        disabled={isSaving}
                        aria-invalid={!!fieldErrors.name || undefined}
                        onChange={(event) => {
                            clearFieldError("name");
                            setName(event.target.value);
                        }}
                        autoComplete="name"
                    />
                    <IdentifyFieldError message={fieldErrors.name} />
                </div>
                <div className="min-w-0">
                    <input
                        className={cn(fieldClass, fieldErrors.email ? "border-red-300" : "border-white/40")}
                        name="email"
                        placeholder={String(resolveLanguageKey("emailPlaceholder"))}
                        type="email"
                        value={email}
                        disabled={isSaving}
                        aria-invalid={!!fieldErrors.email || undefined}
                        onChange={(event) => {
                            clearFieldError("email");
                            setEmail(event.target.value);
                        }}
                        autoComplete="email"
                    />
                    <IdentifyFieldError message={fieldErrors.email} />
                </div>
                <div className="min-w-0">
                    <input
                        className={cn(fieldClass, fieldErrors.phone ? "border-red-300" : "border-white/40")}
                        name="phone"
                        placeholder={String(resolveLanguageKey("numberPlaceholder"))}
                        type="tel"
                        value={phone}
                        disabled={isSaving}
                        aria-invalid={!!fieldErrors.phone || undefined}
                        onChange={(event) => {
                            clearFieldError("phone");
                            setPhone(event.target.value);
                        }}
                        autoComplete="tel"
                    />
                    <IdentifyFieldError message={fieldErrors.phone} />
                </div>
                <div className="flex min-w-0 gap-2">
                    <div className="min-w-0 flex-[1.4]">
                        <input
                            className={cn(fieldClass, fieldErrors.budget ? "border-red-300" : "border-white/40")}
                            name="budget"
                            placeholder={String(resolveLanguageKey("budgetPlaceholder"))}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="any"
                            value={budget}
                            disabled={isSaving}
                            aria-invalid={!!fieldErrors.budget || undefined}
                            onChange={(event) => {
                                clearFieldError("budget");
                                setBudget(event.target.value);
                            }}
                        />
                        <IdentifyFieldError message={fieldErrors.budget} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <select
                            className={cn(fieldClass, "border-white/40 disabled:opacity-60")}
                            name="budgetCurrency"
                            value={budgetCurrency}
                            disabled={isSaving}
                            aria-label={String(resolveLanguageKey("budgetCurrencyPlaceholder"))}
                            onChange={(event) => {
                                setBudgetCurrency(event.target.value);
                            }}
                        >
                            <option value="" className="bg-[#0247fe] text-white">
                                {String(resolveLanguageKey("budgetCurrencyPlaceholder"))}
                            </option>
                            {currencies.map((currency) => (
                                <option key={currency._id} value={currency._id} className="bg-[#0247fe] text-white">
                                    {currency.symbol
                                        ? `${currency.abbreviation} (${currency.symbol})`
                                        : currency.abbreviation || currency.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="min-w-0">
                    <textarea
                        className={cn(fieldClass, "min-h-[4.5rem] resize-none border-white/40")}
                        name="notes"
                        placeholder={String(resolveLanguageKey("notesPlaceholder"))}
                        value={notes}
                        disabled={isSaving}
                        maxLength={500}
                        rows={3}
                        onChange={(event) => {
                            setNotes(event.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 border-t border-white/10 px-3.5 py-3">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="cursor-pointer rounded-lg bg-white px-3 py-1.5 font-aeonik-medium text-xs text-[#0247fe] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSaving ? String(resolveLanguageKey("sending")) : String(resolveLanguageKey("send"))}
                </button>
                <button
                    type="button"
                    onClick={onDismiss}
                    disabled={isSaving}
                    className="cursor-pointer font-aeonik-light text-xs text-white/80 underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {String(resolveLanguageKey("dismiss"))}
                </button>
            </div>
        </div>
    );
}

const IdentifyForm = withLanguage(
    "src/modules/propertyManagement/clients/client/public/shared/aiChat/homepageAiChatPanel.tsx",
)(IdentifyFormInner) as unknown as ComponentType<{
    onSubmit: (details: IdentifyFormValues) => Promise<boolean>;
    onDismiss: () => void;
}>;

function HomepageAiChatPanelInner({resolveLanguageKey}: WithLanguageType) {
    const {
        messages,
        close,
        sendMessage,
        isBotThinking,
        isAgentTyping,
        isConnecting,
        isUnavailable,
        hasAgent,
        agentName,
        status,
        humanHandoffEnabled,
        requireIdentification,
        hasIdentified,
        requestHuman,
        identify,
        startNewChat,
    } = useAiChat();
    const [draft, setDraft] = useState("");
    const [identifyDismissed, setIdentifyDismissed] = useState(false);
    const [identifyForcedOpen, setIdentifyForcedOpen] = useState(false);
    /** Keeps the outcome screen mounted after a successful identify (hasIdentified flips true). */
    const [identifyOutcomeHeld, setIdentifyOutcomeHeld] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isClosed = status === "closed";
    const canSend = !isUnavailable && !isClosed;
    const isWaitingForHuman = status === "requested_human";

    // Greeting-only counts as the idle hero, not a sparse message thread.
    const greetingMessage = messages.length === 1 && messages[0]?.id === "greeting" ? messages[0] : null;
    const hasConversation =
        messages.some((message) => message.id !== "greeting") || isBotThinking || isAgentTyping;

    // Offer "talk to a person" only while the bot still owns the conversation —
    // once escalated or joined, the button would do nothing.
    // Auto-prompt when the tenant requires ID up front, or once a human is involved.
    // Visitors can also open the form themselves via the leave-details button.
    // "Not now" dismisses back to chat; "Leave your details" reopens the form.
    // Outcome hold keeps the success/failure mark visible until "Continue to chat".
    const autoPromptIdentify = requireIdentification || isWaitingForHuman || hasAgent;
    const showIdentifyForm =
        canSend &&
        (identifyOutcomeHeld ||
            (!hasIdentified && (identifyForcedOpen || (autoPromptIdentify && !identifyDismissed))));
    const showLeaveDetailsButton = !hasIdentified && canSend && !showIdentifyForm;
    const canRequestHuman =
        humanHandoffEnabled && canSend && status === "bot" && !showIdentifyForm;

    useEffect(() => {
        if (showIdentifyForm) return;
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages.length, isBotThinking, isAgentTyping, isClosed, showIdentifyForm]);

    const handleSend = useCallback(() => {
        if (!draft.trim() || !canSend) {
            return;
        }
        sendMessage(draft);
        setDraft("");
    }, [draft, sendMessage, canSend]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
            }
        },
        [handleSend],
    );

    const idleCopy = isConnecting
        ? "Connecting…"
        : isUnavailable
            ? "Chat is unavailable right now."
            : greetingMessage?.text ?? "How can I help you today?";

    return (
        <div
            className="isolate relative flex h-[min(85vh,40rem)] w-[min(calc(100vw-2rem),26rem)] flex-col overflow-hidden rounded-2xl shadow-[0_18px_50px_rgba(2,40,140,0.35)]"
            data-node-id="49:1328"
            data-name="AI orb pressed"
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 backdrop-blur-[8px]"
                style={{background: "rgba(2, 71, 254, 0.75)"}}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#0247fe]/92" />
            <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
                    <p className="truncate font-aeonik-medium text-sm text-white/90">
                        {hasAgent && agentName ? agentName : "Pronix assistant"}
                    </p>
                    <WindowChromeButton ariaLabel="Close" onClick={close}>
                        <div className="relative size-2.5 shrink-0">
                            <img alt="" aria-hidden className="absolute inset-[-8.33%] block size-full max-w-none" src={figmaAssets.aiOrbVector} />
                        </div>
                    </WindowChromeButton>
                </div>

                {isClosed ? (
                    <div className="mb-3 shrink-0 rounded-xl bg-white/12 px-3 py-2 font-aeonik-light text-xs leading-relaxed text-white/95">
                        This conversation has been closed.
                    </div>
                ) : hasAgent && agentName ? (
                    <div className="mb-3 shrink-0 rounded-xl bg-white/12 px-3 py-2 font-aeonik-light text-xs leading-relaxed text-white/95">
                        {agentName} joined the conversation.
                    </div>
                ) : isWaitingForHuman ? (
                    <div className="mb-3 shrink-0 rounded-xl bg-white/12 px-3 py-2 font-aeonik-light text-xs leading-relaxed text-white/95">
                        Connecting you with our team — you can keep typing meanwhile.
                    </div>
                ) : null}

                <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                    {showIdentifyForm ? (
                        <IdentifyForm
                            onSubmit={async (details) => {
                                // Hold before identify() flips hasIdentified, or the form unmounts
                                // before the success mark can paint.
                                setIdentifyOutcomeHeld(true);
                                return identify(details);
                            }}
                            onDismiss={() => {
                                setIdentifyOutcomeHeld(false);
                                setIdentifyForcedOpen(false);
                                setIdentifyDismissed(true);
                            }}
                        />
                    ) : hasConversation ? (
                        <div
                            className={cn(
                                "mb-3 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pe-1",
                                "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.45)_rgba(255,255,255,0.12)]",
                                "[&::-webkit-scrollbar]:w-1.5",
                                "[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/10",
                                "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/45",
                                "[&::-webkit-scrollbar-thumb]:hover:bg-white/65",
                            )}
                        >
                            {messages.map((message) => (
                                <ChatBubble key={message.id} message={message} />
                            ))}
                            {isAgentTyping ? (
                                <ThinkingIndicator label={`${agentName ?? "Our team"} is typing`} />
                            ) : isBotThinking ? (
                                <ThinkingIndicator label="Assistant is typing" />
                            ) : null}
                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        <div className="mb-3 flex min-h-0 flex-1 flex-col items-center justify-center gap-3.5 overflow-hidden px-3" data-node-id="49:1335">
                            <div className="pointer-events-none size-16 shrink-0 overflow-hidden md:size-[4.5rem]">
                                <AiOrbVisual variant="hero" />
                            </div>
                            <p className="max-w-[19rem] shrink-0 text-center font-aeonik-medium text-lg font-semibold leading-snug text-white md:text-xl">
                                {idleCopy}
                            </p>
                        </div>
                    )}
                </div>

                {(canRequestHuman || showLeaveDetailsButton) ? (
                    <div className="mb-2 flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1">
                        {showLeaveDetailsButton ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setIdentifyDismissed(false);
                                    setIdentifyForcedOpen(true);
                                }}
                                className="cursor-pointer font-aeonik-light text-xs text-white/75 underline underline-offset-2 transition-colors hover:text-white"
                            >
                                {String(resolveLanguageKey("leaveDetails"))}
                            </button>
                        ) : null}
                        {canRequestHuman ? (
                            <button
                                type="button"
                                onClick={() => requestHuman()}
                                className="cursor-pointer font-aeonik-light text-xs text-white/75 underline underline-offset-2 transition-colors hover:text-white"
                            >
                                {String(resolveLanguageKey("talkToPerson"))}
                            </button>
                        ) : null}
                    </div>
                ) : null}

                {isClosed ? (
                    <div className="relative shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                setIdentifyDismissed(false);
                                setIdentifyForcedOpen(false);
                                setDraft("");
                                startNewChat();
                            }}
                            disabled={isConnecting}
                            className="w-full cursor-pointer rounded-xl bg-white px-3 py-2.5 font-aeonik-medium text-sm text-[#0247fe] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isConnecting ? "Starting…" : "Start a new chat"}
                        </button>
                    </div>
                ) : showIdentifyForm ? null : (
                    <div className="relative shrink-0" data-node-id="49:1342">
                        <div
                            className="relative flex items-center gap-2 rounded-xl border border-white/70 bg-white/5 px-3 py-2.5"
                            data-node-id="49:1343"
                        >
                            <input
                                type="text"
                                value={draft}
                                onChange={(event) => setDraft(event.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={!canSend}
                                maxLength={PUBLIC_CHAT_MAX_MESSAGE_LENGTH}
                                placeholder={
                                    isUnavailable
                                        ? "Chat is unavailable"
                                        : "Type a message…"
                                }
                                className="min-w-0 flex-1 bg-transparent font-aeonik-light text-[15px] leading-6 text-white outline-none placeholder:text-white/55 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={!draft.trim() || !canSend}
                                className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Send"
                            >
                                <img alt="" aria-hidden className="block size-[17px] max-w-none" src={figmaAssets.aiOrbSendIcon} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const HomepageAiChatPanel = withLanguage(
    "src/modules/propertyManagement/clients/client/public/shared/aiChat/homepageAiChatPanel.tsx",
)(HomepageAiChatPanelInner) as unknown as ComponentType;

export default HomepageAiChatPanel;
