import React, {useEffect, useImperativeHandle, useRef, useState} from "react";
import {compose} from "redux";
import {cn} from "@coreModule/components/lib/utils.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {contactAssets} from "@propertyManagementModule/clients/client/public/contact/contactAssets.ts";
import {
    MarketingCompanyAddress,
    MarketingCompanyResponse,
    PublicLanguageProps,
} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import type {MarketingContactFormType} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingContact/marketingContact.form.validator";
import type {MarketingContactFormResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingContact/marketingContact.form.response.type";

const CONTACT_INFO_LABEL =
    "font-aeonik-light text-[20px] leading-none tracking-normal text-pronix-ink-muted not-italic md:text-base md:leading-[1.4]";

const CONTACT_INFO_VALUE =
    "cursor-default font-aeonik-medium text-[24px] leading-none tracking-normal text-pronix-ink not-italic md:text-2xl md:leading-[1.4] lg:text-[24px]";

type ContactContentSectionProps = PublicLanguageProps & WithAxiosType<MarketingCompanyResponse>;

type ContactFieldKey = keyof MarketingContactFormType;
type ContactFieldErrors = Partial<Record<ContactFieldKey, string>>;

const INTEREST_OPTIONS = [
    {value: "partnerships", labelKey: "interestPartnership"},
    {value: "investments", labelKey: "interestInvestment"},
    {value: "platform_support", labelKey: "interestSupport"},
    {value: "reservation", labelKey: "interestReservation"},
    {value: "other", labelKey: "interestOther"},
] as const;

const fieldInputClass =
    "w-full min-w-0 cursor-text border-0 bg-transparent font-aeonik-light text-[20px] leading-[17.15px] tracking-normal text-pronix-ink outline-none placeholder:text-pronix-ink/50 md:text-lg md:leading-none disabled:cursor-not-allowed disabled:opacity-60";
const fieldShellClass = "flex w-full min-w-0 items-center border-b px-2.5 py-4";
const fieldShellErrorClass = (hasError: boolean) => (hasError ? "border-red-500" : "border-pronix-ink/30");

function googleMapsUrl(address: MarketingCompanyAddress): string {
    if (address.latitude != null && address.longitude != null) {
        return `https://www.google.com/maps?q=${address.latitude},${address.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.label)}`;
}

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

function FieldError({message}: {message?: string}) {
    if (!message) return null;
    return (
        <p role="alert" className="mt-2 font-aeonik-medium text-sm leading-[1.3] text-red-600">
            {message}
        </p>
    );
}

type ContactFormProps = PublicLanguageProps & WithAxiosType<MarketingContactFormResponseType, MarketingContactFormType>;

function ContactFormInner({resolveLanguageKey, onPost, loading, innerRef, error}: ContactFormProps) {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [interest, setInterest] = useState("");
    const [message, setMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
    const [submitted, setSubmitted] = useState(false);

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setName("");
            setSurname("");
            setEmail("");
            setPhone("");
            setInterest("");
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
            <div className="mt-10 flex flex-col gap-6 md:mt-12 md:gap-8" data-node-id="320:570">
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
                        <FieldError message={fieldErrors.name} />
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
                        <FieldError message={fieldErrors.surname} />
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
                    <FieldError message={fieldErrors.email} />
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
                    <FieldError message={fieldErrors.phone} />
                </div>
                <div className="w-full min-w-0">
                    <div className={cn(fieldShellClass, "border-pronix-ink/30")}>
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
                                interest ? "text-pronix-ink" : "text-pronix-ink/50",
                            )}
                        >
                            <option value="" disabled>
                                {resolveLanguageKey("interestPlaceholder")}
                            </option>
                            {INTEREST_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value} className="text-pronix-ink">
                                    {resolveLanguageKey(option.labelKey)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
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
                    <FieldError message={fieldErrors.message} />
                </div>
            </div>
            <div className="mt-5 flex w-full min-w-0 flex-col gap-3">
                <button
                    type="button"
                    disabled={loading}
                    onClick={handleSend}
                    className={cn(
                        "w-full cursor-pointer rounded-[5px] bg-pronix-blue py-3 font-aeonik-medium text-base text-white not-italic transition hover:opacity-90 md:text-lg",
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50",
                    )}
                >
                    {loading ? resolveLanguageKey("sending") : resolveLanguageKey("send")}
                </button>
                {submitted ? (
                    <p role="status" className="font-aeonik-medium text-base leading-[1.3] text-pronix-ink">
                        {resolveLanguageKey("formSuccess")}
                    </p>
                ) : null}
                {error && !submitted && Object.keys(fieldErrors).length === 0 ? (
                    <p role="alert" className="font-aeonik-medium text-base leading-[1.3] text-red-600">
                        {resolveLanguageKey("formError")}
                    </p>
                ) : null}
            </div>
        </>
    );
}

const ContactForm = compose(
    withAxios<MarketingContactFormResponseType, MarketingContactFormType>(
        {method: "post", url: "/api/realEstate/marketingContact", data: {}},
        true,
    ),
    withDebug(true, true),
)(ContactFormInner) as unknown as React.ComponentType<PublicLanguageProps>;

function ContactContentSectionInner({
    resolveLanguageKey,
    currentLanguage,
    languageCode,
    data,
    onFilterChange,
}: ContactContentSectionProps) {
    const initialFetchDone = useRef(false);
    const addresses = data?.addresses ?? [];

    useEffect(() => {
        if (initialFetchDone.current) {
            return;
        }
        initialFetchDone.current = true;
        onFilterChange({});
        // Intentionally mount-only: onFilterChange identity changes every withAxios render.
    }, []);

    return (
        <div className="relative grid w-full grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10" data-node-id="305:228">
            <div className="min-w-0" data-node-id="320:583">
                <h1 className="max-w-lg cursor-default font-aeonik-medium text-[40px] leading-[1.1] tracking-normal text-pronix-ink not-italic md:text-5xl md:leading-[1.2] lg:text-[56px]">
                    {resolveLanguageKey("title")}
                </h1>
                <ContactForm
                    resolveLanguageKey={resolveLanguageKey}
                    currentLanguage={currentLanguage}
                    languageCode={languageCode}
                />
                <div className="mt-8 flex flex-col gap-6" data-node-id="320:586">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2" data-node-id="320:587">
                        <div data-node-id="320:588">
                            <p className={CONTACT_INFO_LABEL}>
                                {resolveLanguageKey("phoneLabel")}
                            </p>
                            <p className={`mt-2 ${CONTACT_INFO_VALUE}`}>
                                {data?.phoneNumber ?? ""}
                            </p>
                        </div>
                        <div data-node-id="320:591">
                            <p className={CONTACT_INFO_LABEL}>
                                {resolveLanguageKey("emailLabel")}
                            </p>
                            <p className={`mt-2 ${CONTACT_INFO_VALUE}`}>
                                {data?.email ?? ""}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2" data-node-id="320:594">
                        <div data-node-id="320:595">
                            <p className={CONTACT_INFO_LABEL}>
                                {resolveLanguageKey("addressLabel")}
                            </p>
                            {addresses.length > 0 ? (
                                <ul className="mt-2 flex list-none flex-col gap-1.5 p-0">
                                    {addresses.map((address) => (
                                        <li key={`${address.label}-${address.latitude ?? ""}-${address.longitude ?? ""}`}>
                                            <a
                                                href={googleMapsUrl(address)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`${CONTACT_INFO_VALUE} transition hover:opacity-70`}
                                            >
                                                {address.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={`mt-2 ${CONTACT_INFO_VALUE}`} />
                            )}
                        </div>
                        <div data-node-id="320:598">
                            <p className={CONTACT_INFO_LABEL}>
                                {resolveLanguageKey("hoursLabel")}
                            </p>
                            <p className={`mt-2 ${CONTACT_INFO_VALUE}`}>
                                {resolveLanguageKey("hoursValue")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative min-h-[320px] overflow-hidden rounded-[5px] lg:min-h-[500px]" data-node-id="320:602">
                <img alt="" aria-hidden className="size-full object-cover" src={contactAssets.scene} />
                <div
                    className="absolute left-4 top-4 rounded-[5px] px-4 py-2 font-aeonik-light text-sm text-white backdrop-blur-md md:left-6 md:top-6 md:text-sm"
                    style={{background: "rgba(0,0,0,0.35)"}}
                >
                    {resolveLanguageKey("openToday")}
                </div>
                <div
                    className="absolute bottom-4 left-4 flex w-40 min-h-40 flex-col rounded-[5px] backdrop-blur-[47px] md:bottom-6 md:left-6 md:w-[239px] md:min-h-[239px]"
                    style={{background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)"}}
                >
                    <img alt="" aria-hidden className="absolute left-4 top-4 size-10 md:left-5 md:top-5 md:size-[50px]" src={figmaAssets.ctaEllipse} />
                    <div className="mt-auto flex flex-col gap-1.5 px-4 pb-4 pt-16 md:px-5 md:pb-5 md:pt-20">
                        {addresses.length > 0 ? (
                            addresses.map((address) => (
                                <a
                                    key={`map-${address.label}-${address.latitude ?? ""}-${address.longitude ?? ""}`}
                                    href={googleMapsUrl(address)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-aeonik-medium text-base text-white not-italic leading-[1.2] transition hover:opacity-70 md:text-lg"
                                >
                                    {address.label}
                                </a>
                            ))
                        ) : (
                            <p className="font-aeonik-medium text-base text-white not-italic md:text-lg leading-[1.2]">
                                {resolveLanguageKey("findUs")}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default compose(
    withAxios<MarketingCompanyResponse>(
        {method: "post", url: "/api/realEstate/marketingCompany", data: {}},
        true,
    ),
    withDebug(true, true),
)(ContactContentSectionInner) as unknown as React.ComponentType<PublicLanguageProps>;
