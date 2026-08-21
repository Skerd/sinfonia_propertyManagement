import React, {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import {cn} from "@coreModule/components/lib/utils.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import type {MarketingContactFormType} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingContact/marketingContact.form.validator";
import type {MarketingContactFormResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingContact/marketingContact.form.response.type";

type ContactFieldKey = keyof MarketingContactFormType;
type ContactFieldErrors = Partial<Record<ContactFieldKey, string>>;

export const MARKETING_CONTACT_INTEREST_OPTIONS = [
    {value: "partnerships", labelKey: "interestPartnership"},
    {value: "investments", labelKey: "interestInvestment"},
    {value: "platform_support", labelKey: "interestSupport"},
    {value: "reservation", labelKey: "interestReservation"},
    {value: "other", labelKey: "interestOther"},
] as const;

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateContactForm(
    values: MarketingContactFormType,
    resolveLanguageKey: PublicLanguageProps["resolveLanguageKey"],
): ContactFieldErrors {
    const errors: ContactFieldErrors = {};
    if (!values.name.trim()) errors.name = resolveLanguageKey("nameRequired");
    if (!values.surname.trim()) errors.surname = resolveLanguageKey("surnameRequired");
    if (!values.email.trim()) {
        errors.email = resolveLanguageKey("emailRequired");
    } else if (!isValidEmail(values.email.trim())) {
        errors.email = resolveLanguageKey("emailInvalid");
    }
    if (!values.phone.trim()) errors.phone = resolveLanguageKey("phoneRequired");
    if (!values.message.trim()) errors.message = resolveLanguageKey("messageRequired");
    return errors;
}

function FieldError({message, onDark}: {message?: string; onDark?: boolean}) {
    if (!message) return null;
    return (
        <p
            role="alert"
            className={cn(
                "mt-2 font-aeonik-medium text-sm leading-[1.3]",
                onDark ? "text-red-200" : "text-red-600",
            )}
        >
            {message}
        </p>
    );
}

export type MarketingContactFormProps = PublicLanguageProps & {
    /** Pre-select interest (e.g. `"partnerships"`). Cleared fields reset to this value on success. */
    defaultInterest?: string;
    /** Hide the interest select; `defaultInterest` is still submitted when set. */
    hideInterest?: boolean;
    /** `onDark` = white fields/borders for blue or dark surfaces. */
    variant?: "default" | "onDark";
};

type MarketingContactFormInnerProps = MarketingContactFormProps &
    WithAxiosType<MarketingContactFormResponseType, MarketingContactFormType>;

function MarketingContactFormInner({
    resolveLanguageKey,
    onPost,
    loading,
    innerRef,
    error,
    defaultInterest = "",
    hideInterest = false,
    variant = "default",
}: MarketingContactFormInnerProps) {
    const onDark = variant === "onDark";
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [interest, setInterest] = useState(defaultInterest);
    const [message, setMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
    const [submitted, setSubmitted] = useState(false);

    const fieldInputClass = cn(
        "w-full min-w-0 cursor-text border-0 bg-transparent text-[20px] leading-[17.15px] tracking-normal outline-none md:text-lg md:leading-none disabled:cursor-not-allowed disabled:opacity-60",
        onDark
            ? "font-aeonik-medium text-white placeholder:text-white/50 caret-white"
            : "font-aeonik-light text-pronix-ink placeholder:text-pronix-ink/50",
    );
    const fieldShellClass = "flex w-full min-w-0 items-center border-b px-2.5 py-4";
    const fieldShellErrorClass = (hasError: boolean) =>
        hasError ? (onDark ? "border-red-300" : "border-red-500") : onDark ? "border-white/50" : "border-pronix-ink/30";

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setName("");
            setSurname("");
            setEmail("");
            setPhone("");
            setInterest(defaultInterest);
            setMessage("");
            setFieldErrors({});
            setSubmitted(true);
        },
        error: () => {
            setSubmitted(false);
        },
    }));

    const clearFieldError = (key: ContactFieldKey) => {
        setFieldErrors((prev) => {
            if (!prev[key]) return prev;
            const next = {...prev};
            delete next[key];
            return next;
        });
    };

    const handleSend = () => {
        if (loading) return;
        setSubmitted(false);
        const trimmedMessage = message.trim();
        const values: MarketingContactFormType = {
            name: name.trim(),
            surname: surname.trim(),
            email: email.trim(),
            phone: phone.trim(),
            message: trimmedMessage,
        };
        const errors = validateContactForm(values, resolveLanguageKey);
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        onPost({
            ...values,
            ...(interest ? {interest} : {}),
        });
    };

    return (
        <>
            <div
                className={cn(
                    "flex flex-col gap-6 md:gap-8",
                    hideInterest ? "mt-0" : "mt-10 md:mt-12",
                )}
                data-node-id="320:570"
            >
                <div className="grid w-full min-w-0 grid-cols-2 gap-4 sm:gap-8">
                    <div className="min-w-0">
                        <div className={cn(fieldShellClass, fieldShellErrorClass(!!fieldErrors.name))}>
                            <input
                                type="text"
                                name="name"
                                autoComplete="given-name"
                                placeholder={resolveLanguageKey("namePlaceholder")}
                                value={name}
                                disabled={loading}
                                aria-invalid={!!fieldErrors.name || undefined}
                                onChange={(e) => {
                                    setSubmitted(false);
                                    clearFieldError("name");
                                    setName(e.target.value);
                                }}
                                className={fieldInputClass}
                            />
                        </div>
                        <FieldError message={fieldErrors.name} onDark={onDark} />
                    </div>
                    <div className="min-w-0">
                        <div className={cn(fieldShellClass, fieldShellErrorClass(!!fieldErrors.surname))}>
                            <input
                                type="text"
                                name="surname"
                                autoComplete="family-name"
                                placeholder={resolveLanguageKey("lastNamePlaceholder")}
                                value={surname}
                                disabled={loading}
                                aria-invalid={!!fieldErrors.surname || undefined}
                                onChange={(e) => {
                                    setSubmitted(false);
                                    clearFieldError("surname");
                                    setSurname(e.target.value);
                                }}
                                className={fieldInputClass}
                            />
                        </div>
                        <FieldError message={fieldErrors.surname} onDark={onDark} />
                    </div>
                </div>
                <div className="w-full min-w-0">
                    <div className={cn(fieldShellClass, fieldShellErrorClass(!!fieldErrors.email))}>
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            placeholder={resolveLanguageKey("emailPlaceholder")}
                            value={email}
                            disabled={loading}
                            aria-invalid={!!fieldErrors.email || undefined}
                            onChange={(e) => {
                                setSubmitted(false);
                                clearFieldError("email");
                                setEmail(e.target.value);
                            }}
                            className={fieldInputClass}
                        />
                    </div>
                    <FieldError message={fieldErrors.email} onDark={onDark} />
                </div>
                <div className="w-full min-w-0">
                    <div className={cn(fieldShellClass, fieldShellErrorClass(!!fieldErrors.phone))}>
                        <input
                            type="tel"
                            name="phone"
                            autoComplete="tel"
                            placeholder={resolveLanguageKey("phonePlaceholder")}
                            value={phone}
                            disabled={loading}
                            aria-invalid={!!fieldErrors.phone || undefined}
                            onChange={(e) => {
                                setSubmitted(false);
                                clearFieldError("phone");
                                setPhone(e.target.value);
                            }}
                            className={fieldInputClass}
                        />
                    </div>
                    <FieldError message={fieldErrors.phone} onDark={onDark} />
                </div>
                {!hideInterest ? (
                    <div className="w-full min-w-0">
                        <div className={cn(fieldShellClass, onDark ? "border-white/50" : "border-pronix-ink/30")}>
                            <select
                                name="interest"
                                value={interest}
                                disabled={loading}
                                onChange={(e) => {
                                    setSubmitted(false);
                                    setInterest(e.target.value);
                                }}
                                className={cn(
                                    fieldInputClass,
                                    "appearance-none bg-transparent",
                                    interest
                                        ? onDark
                                            ? "text-white"
                                            : "text-pronix-ink"
                                        : onDark
                                          ? "text-white/50"
                                          : "text-pronix-ink/50",
                                )}
                            >
                                <option value="" disabled>
                                    {resolveLanguageKey("interestPlaceholder")}
                                </option>
                                {MARKETING_CONTACT_INTEREST_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value} className="text-pronix-ink">
                                        {resolveLanguageKey(option.labelKey)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : null}
                <div className="w-full min-w-0">
                    <div
                        className={cn(
                            "flex min-h-[116px] w-full min-w-0 items-start border-b px-2.5 py-4",
                            fieldShellErrorClass(!!fieldErrors.message),
                        )}
                    >
                        <textarea
                            name="message"
                            placeholder={resolveLanguageKey("messagePlaceholder")}
                            rows={3}
                            value={message}
                            disabled={loading}
                            aria-invalid={!!fieldErrors.message || undefined}
                            onChange={(e) => {
                                setSubmitted(false);
                                clearFieldError("message");
                                setMessage(e.target.value);
                            }}
                            className={cn(fieldInputClass, "min-h-[4.5rem] resize-none")}
                        />
                    </div>
                    <FieldError message={fieldErrors.message} onDark={onDark} />
                </div>
            </div>
            <div className="mt-8 flex w-full min-w-0 flex-col gap-3">
                <button
                    type="button"
                    disabled={loading}
                    onClick={handleSend}
                    className={cn(
                        "flex w-full min-w-0 cursor-pointer items-center justify-center border px-6 py-4 font-aeonik-medium text-[20px] not-italic leading-[17.15px] tracking-normal transition-colors duration-200 md:text-lg lg:text-[24px]",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        onDark
                            ? "border-white bg-transparent text-white hover:bg-white hover:text-pronix-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-pronix-blue disabled:hover:bg-transparent disabled:hover:text-white"
                            : "rounded-[5px] border-transparent bg-pronix-blue py-3 text-base text-white hover:opacity-90 md:text-lg",
                    )}
                >
                    {loading ? resolveLanguageKey("sending") : resolveLanguageKey("send")}
                </button>
                {submitted ? (
                    <p
                        role="status"
                        className={cn(
                            "font-aeonik-medium text-base leading-[1.3]",
                            onDark ? "text-white" : "text-pronix-ink",
                        )}
                    >
                        {resolveLanguageKey("formSuccess")}
                    </p>
                ) : null}
                {error && !submitted && Object.keys(fieldErrors).length === 0 ? (
                    <p
                        role="alert"
                        className={cn(
                            "font-aeonik-medium text-base leading-[1.3]",
                            onDark ? "text-red-200" : "text-red-600",
                        )}
                    >
                        {resolveLanguageKey("formError")}
                    </p>
                ) : null}
            </div>
        </>
    );
}

const MarketingContactForm = compose(
    withAxios<MarketingContactFormResponseType, MarketingContactFormType>(
        {method: "post", url: "/api/realEstate/marketingContact", data: {}},
        true,
    ),
    withDebug(true, true),
)(MarketingContactFormInner) as unknown as React.ComponentType<MarketingContactFormProps>;

export default MarketingContactForm;
