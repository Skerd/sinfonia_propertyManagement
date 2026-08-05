import React, {useEffect, useImperativeHandle, useState} from "react";
import {createPortal} from "react-dom";
import {compose} from "redux";
import {cn} from "@coreModule/components/lib/utils.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {PUBLIC_HEADING} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import {lockPublicBodyScroll} from "@propertyManagementModule/clients/client/public/shared/lockPublicBodyScroll.ts";
import {projectsAssets} from "@propertyManagementModule/clients/client/public/projects/projectsAssets.ts";
import type {MarketingContactFormType} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingContact/marketingContact.form.validator";
import type {MarketingContactFormResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingContact/marketingContact.form.response.type";

export type PropertyContactFormMode = "requestInfo" | "reserve";

type PropertyContactFormModalProps = PublicLanguageProps & {
    open: boolean;
    onClose: () => void;
    projectId: string;
    unitId: string;
    unitName: string;
    mode: PropertyContactFormMode;
    title?: string;
};

type ContactFieldKey = keyof MarketingContactFormType;
type ContactFieldErrors = Partial<Record<ContactFieldKey, string>>;

/** Reserve Online always submits reservation interest (field hidden). */
const UNIT_RESERVE_INTEREST = "reservation" as const;

const INTEREST_OPTIONS = [
    {value: "investments", labelKey: "interestInvestment"},
    {value: "partnerships", labelKey: "interestPartnership"},
    {value: "platform_support", labelKey: "interestSupport"},
    {value: "reservation", labelKey: "interestReservation"},
    {value: "other", labelKey: "interestOther"},
] as const;

const fieldClass =
    "w-full rounded-[5px] border px-4 py-4 font-aeonik-light text-base text-pronix-ink outline-none transition-colors md:text-lg disabled:cursor-not-allowed disabled:opacity-60";

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

type FormInnerProps = PublicLanguageProps &
    WithAxiosType<MarketingContactFormResponseType, MarketingContactFormType> & {
        projectId: string;
        unitId: string;
        unitName: string;
        mode: PropertyContactFormMode;
        onClose: () => void;
    };

function PropertyContactFormInner({
    resolveLanguageKey,
    onPost,
    loading,
    innerRef,
    error,
    projectId,
    unitId,
    unitName,
    mode,
    onClose,
}: FormInnerProps) {
    const lockInterestToReservation = mode === "reserve";
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
        const resolvedInterest = lockInterestToReservation
            ? UNIT_RESERVE_INTEREST
            : interest || undefined;
        const values: MarketingContactFormType = {
            name: name.trim(),
            surname: surname.trim(),
            email: email.trim(),
            phone: phone.trim(),
            message: message.trim(),
            projectInterest: projectId,
            unitInterest: unitId,
            ...(resolvedInterest ? {interest: resolvedInterest} : {}),
        };
        const errors = validateContactForm(values, resolveLanguageKey);
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        onPost(values);
    };

    return (
        <>
            <p className="mt-2 font-aeonik-light text-base text-pronix-ink-muted not-italic md:text-lg">
                {resolveLanguageKey("formUnitLabel")}: {unitName}
            </p>
            <div className="mt-6 flex flex-col gap-5 md:mt-8 md:gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                    <div className="min-w-0 flex-1">
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
                            className={cn(fieldClass, fieldErrors.name ? "border-red-500" : "border-pronix-border")}
                        />
                        <FieldError message={fieldErrors.name} />
                    </div>
                    <div className="min-w-0 flex-1">
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
                            className={cn(fieldClass, fieldErrors.surname ? "border-red-500" : "border-pronix-border")}
                        />
                        <FieldError message={fieldErrors.surname} />
                    </div>
                </div>
                <div className="w-full min-w-0">
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
                        className={cn(fieldClass, fieldErrors.email ? "border-red-500" : "border-pronix-border")}
                    />
                    <FieldError message={fieldErrors.email} />
                </div>
                <div className="w-full min-w-0">
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
                        className={cn(fieldClass, fieldErrors.phone ? "border-red-500" : "border-pronix-border")}
                    />
                    <FieldError message={fieldErrors.phone} />
                </div>
                {!lockInterestToReservation ? (
                    <div className="w-full min-w-0">
                        <select
                            name="interest"
                            value={interest}
                            disabled={loading}
                            onChange={(e) => {
                                setSubmitted(false);
                                setInterest(e.target.value);
                            }}
                            className={cn(
                                fieldClass,
                                "border-pronix-border",
                                interest ? "text-pronix-ink" : "text-pronix-ink-muted",
                            )}
                        >
                            <option value="" disabled>
                                {resolveLanguageKey("interestPlaceholder")}
                            </option>
                            {INTEREST_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {resolveLanguageKey(option.labelKey)}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}
                <div className="w-full min-w-0">
                    <textarea
                        name="message"
                        placeholder={resolveLanguageKey("messagePlaceholder")}
                        value={message}
                        disabled={loading}
                        aria-invalid={!!fieldErrors.message || undefined}
                        onChange={(e) => {
                            setSubmitted(false);
                            clearFieldError("message");
                            setMessage(e.target.value);
                        }}
                        className={cn(
                            fieldClass,
                            "min-h-[100px] resize-none",
                            fieldErrors.message ? "border-red-500" : "border-pronix-border",
                        )}
                    />
                    <FieldError message={fieldErrors.message} />
                </div>
            </div>
            <div className="mt-6 flex w-full min-w-0 flex-col gap-3">
                <button
                    type="button"
                    disabled={loading}
                    onClick={handleSend}
                    className={cn(
                        "flex w-full cursor-pointer items-center justify-center border border-pronix-ink px-6 py-4",
                        "bg-transparent text-pronix-ink transition-colors duration-200",
                        "hover:bg-pronix-ink hover:text-white",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pronix-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-pronix-ink",
                    )}
                >
                    <span className="font-aeonik-medium whitespace-nowrap not-italic text-base leading-[17.15px] md:text-lg">
                        {loading ? resolveLanguageKey("sending") : resolveLanguageKey("send")}
                    </span>
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
                {submitted ? (
                    <button
                        type="button"
                        onClick={onClose}
                        className="font-aeonik-medium text-base text-pronix-blue transition hover:underline md:text-lg"
                    >
                        {resolveLanguageKey("formClose")}
                    </button>
                ) : null}
            </div>
        </>
    );
}

const PropertyContactForm = compose(
    withAxios<MarketingContactFormResponseType, MarketingContactFormType>(
        {method: "post", url: "/api/realEstate/marketingContact", data: {}},
        true,
    ),
    withDebug(true, true),
)(PropertyContactFormInner) as unknown as React.ComponentType<
    PublicLanguageProps & {
        projectId: string;
        unitId: string;
        unitName: string;
        mode: PropertyContactFormMode;
        onClose: () => void;
    }
>;

function PropertyContactFormModal({
    open,
    onClose,
    projectId,
    unitId,
    unitName,
    mode,
    title,
    resolveLanguageKey,
    currentLanguage,
    languageCode,
}: PropertyContactFormModalProps) {
    useEffect(() => {
        if (!open) return;
        return lockPublicBodyScroll();
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[150] flex flex-col sm:items-center sm:justify-center sm:bg-black/40 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="property-contact-form-title"
            onClick={onClose}
        >
            <div
                className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white sm:max-h-[90vh] sm:w-full sm:max-w-xl sm:flex-none sm:rounded-[5px] sm:shadow-lg"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex flex-col gap-2 px-5 py-5 md:px-6 md:py-6">
                    <div className="flex items-center justify-between gap-4 border-b border-pronix-border pb-3">
                        <h2 id="property-contact-form-title" className={PUBLIC_HEADING}>
                            {title ?? resolveLanguageKey("formTitle")}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex size-9 shrink-0 items-center justify-center rounded-[5px] border border-pronix-border transition duration-200 hover:border-pronix-ink hover:bg-pronix-ink/5"
                            aria-label={resolveLanguageKey("formClose")}
                        >
                            <img alt="" aria-hidden className="size-6" src={projectsAssets.filterClose} />
                        </button>
                    </div>
                    <PropertyContactForm
                        key={`${mode}:${projectId}:${unitId}`}
                        resolveLanguageKey={resolveLanguageKey}
                        currentLanguage={currentLanguage}
                        languageCode={languageCode}
                        projectId={projectId}
                        unitId={unitId}
                        unitName={unitName}
                        mode={mode}
                        onClose={onClose}
                    />
                </div>
            </div>
        </div>,
        document.body,
    );
}

export default PropertyContactFormModal;
