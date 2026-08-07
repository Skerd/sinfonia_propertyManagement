import React, {useImperativeHandle, useState} from "react";
import {compose} from "redux";
import {cn} from "@coreModule/components/lib/utils.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {useDyeusProjectId} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusProjectId.ts";
import type {MarketingContactFormType} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingContact/marketingContact.form.validator";
import type {MarketingContactFormResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingContact/marketingContact.form.response.type";

type ContactFieldKey = keyof MarketingContactFormType;
type ContactFieldErrors = Partial<Record<ContactFieldKey, string>>;

const INTEREST_OPTIONS = [
    {value: "reservation", label: "Reservation"},
    {value: "investments", label: "Investments"},
    {value: "partnerships", label: "Partnerships"},
    {value: "other", label: "Other"},
] as const;

const fieldInputClass =
    "border-b border-dyeus-border bg-transparent py-2 font-dyeus-sans text-base outline-none focus:border-dyeus-bronze disabled:cursor-not-allowed disabled:opacity-60";

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateContactForm(values: MarketingContactFormType): ContactFieldErrors {
    const errors: ContactFieldErrors = {};
    if (!values.name.trim()) errors.name = "First name is required.";
    if (!values.surname.trim()) errors.surname = "Surname is required.";
    if (!values.email.trim()) {
        errors.email = "Email is required.";
    } else if (!isValidEmail(values.email.trim())) {
        errors.email = "Enter a valid email.";
    }
    if (!values.phone.trim()) errors.phone = "Phone is required.";
    if (!values.message.trim()) errors.message = "Message is required.";
    return errors;
}

function FieldError({message}: {message?: string}) {
    if (!message) return null;
    return (
        <p role="alert" className="mt-1 font-dyeus-sans text-sm text-red-700">
            {message}
        </p>
    );
}

export type DyeusMarketingContactFormProps = {
    /** When set, locks interest to reservation and hides the select (unit enquiry). */
    lockInterestToReservation?: boolean;
    projectInterest?: string;
    unitInterest?: string;
    defaultEmail?: string;
    defaultMessage?: string;
    submitLabel?: string;
    className?: string;
};

type FormInnerProps = DyeusMarketingContactFormProps &
    WithAxiosType<MarketingContactFormResponseType, MarketingContactFormType>;

function DyeusMarketingContactFormInner({
    onPost,
    loading,
    innerRef,
    error,
    lockInterestToReservation = false,
    projectInterest,
    unitInterest,
    defaultEmail = "",
    defaultMessage = "",
    submitLabel = "Send enquiry",
    className,
}: FormInnerProps) {
    const {projectId: dyeusProjectId, loading: resolvingProject} = useDyeusProjectId();
    const effectiveProjectInterest = (projectInterest || dyeusProjectId).trim();
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState(defaultEmail);
    const [phone, setPhone] = useState("");
    const [interest, setInterest] = useState(lockInterestToReservation ? "reservation" : "");
    const [message, setMessage] = useState(defaultMessage);
    const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [projectError, setProjectError] = useState<string | null>(null);

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setName("");
            setSurname("");
            setEmail(defaultEmail);
            setPhone("");
            setInterest(lockInterestToReservation ? "reservation" : "");
            setMessage(defaultMessage);
            setFieldErrors({});
            setProjectError(null);
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
        if (loading || resolvingProject) return;
        setSubmitted(false);
        setProjectError(null);

        if (!effectiveProjectInterest) {
            setProjectError("Unable to resolve the Dyeus project. Please try again.");
            return;
        }

        const resolvedInterest = lockInterestToReservation
            ? "reservation"
            : interest || undefined;
        const values: MarketingContactFormType = {
            name: name.trim(),
            surname: surname.trim(),
            email: email.trim(),
            phone: phone.trim(),
            message: message.trim(),
            projectInterest: effectiveProjectInterest,
            ...(unitInterest ? {unitInterest} : {}),
            ...(resolvedInterest ? {interest: resolvedInterest} : {}),
        };
        const errors = validateContactForm(values);
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        onPost(values);
    };

    return (
        <div className={cn("flex flex-col gap-5", className)}>
            <div className="flex flex-col gap-5 sm:flex-row sm:gap-5">
                <label className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="font-dyeus-sans text-xs uppercase tracking-[0.18em] text-dyeus-ink-faded">
                        First name
                    </span>
                    <input
                        type="text"
                        name="name"
                        autoComplete="given-name"
                        value={name}
                        disabled={loading}
                        aria-invalid={!!fieldErrors.name || undefined}
                        onChange={(e) => {
                            setSubmitted(false);
                            clearFieldError("name");
                            setName(e.target.value);
                        }}
                        className={cn(fieldInputClass, fieldErrors.name && "border-red-600")}
                    />
                    <FieldError message={fieldErrors.name} />
                </label>
                <label className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="font-dyeus-sans text-xs uppercase tracking-[0.18em] text-dyeus-ink-faded">
                        Surname
                    </span>
                    <input
                        type="text"
                        name="surname"
                        autoComplete="family-name"
                        value={surname}
                        disabled={loading}
                        aria-invalid={!!fieldErrors.surname || undefined}
                        onChange={(e) => {
                            setSubmitted(false);
                            clearFieldError("surname");
                            setSurname(e.target.value);
                        }}
                        className={cn(fieldInputClass, fieldErrors.surname && "border-red-600")}
                    />
                    <FieldError message={fieldErrors.surname} />
                </label>
            </div>

            <label className="flex flex-col gap-2">
                <span className="font-dyeus-sans text-xs uppercase tracking-[0.18em] text-dyeus-ink-faded">
                    Email
                </span>
                <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    disabled={loading}
                    aria-invalid={!!fieldErrors.email || undefined}
                    onChange={(e) => {
                        setSubmitted(false);
                        clearFieldError("email");
                        setEmail(e.target.value);
                    }}
                    className={cn(fieldInputClass, fieldErrors.email && "border-red-600")}
                />
                <FieldError message={fieldErrors.email} />
            </label>

            <label className="flex flex-col gap-2">
                <span className="font-dyeus-sans text-xs uppercase tracking-[0.18em] text-dyeus-ink-faded">
                    Phone
                </span>
                <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={phone}
                    disabled={loading}
                    aria-invalid={!!fieldErrors.phone || undefined}
                    onChange={(e) => {
                        setSubmitted(false);
                        clearFieldError("phone");
                        setPhone(e.target.value);
                    }}
                    className={cn(fieldInputClass, fieldErrors.phone && "border-red-600")}
                />
                <FieldError message={fieldErrors.phone} />
            </label>

            {!lockInterestToReservation ? (
                <label className="flex flex-col gap-2">
                    <span className="font-dyeus-sans text-xs uppercase tracking-[0.18em] text-dyeus-ink-faded">
                        Interest
                    </span>
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
                            interest ? "text-dyeus-ink" : "text-dyeus-ink-faded",
                        )}
                    >
                        <option value="" disabled>
                            Select interest
                        </option>
                        {INTEREST_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            ) : null}

            <label className="flex flex-col gap-2">
                <span className="font-dyeus-sans text-xs uppercase tracking-[0.18em] text-dyeus-ink-faded">
                    Message
                </span>
                <textarea
                    name="message"
                    rows={5}
                    value={message}
                    disabled={loading}
                    aria-invalid={!!fieldErrors.message || undefined}
                    onChange={(e) => {
                        setSubmitted(false);
                        clearFieldError("message");
                        setMessage(e.target.value);
                    }}
                    className={cn(
                        "resize-none border border-dyeus-border bg-transparent p-3 font-dyeus-sans text-base outline-none focus:border-dyeus-bronze disabled:cursor-not-allowed disabled:opacity-60",
                        fieldErrors.message && "border-red-600",
                    )}
                />
                <FieldError message={fieldErrors.message} />
            </label>

            <button
                type="button"
                disabled={loading || resolvingProject}
                onClick={handleSend}
                className="mt-2 cursor-pointer bg-dyeus-ink px-6 py-3 font-dyeus-sans text-xs uppercase tracking-[0.2em] text-dyeus-cream transition hover:bg-dyeus-bronze-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? "Sending…" : resolvingProject ? "Loading…" : submitLabel}
            </button>

            {submitted ? (
                <p role="status" className="font-dyeus-sans text-sm text-dyeus-ink">
                    Thank you — we received your enquiry and will be in touch shortly.
                </p>
            ) : null}
            {projectError ? (
                <p role="alert" className="font-dyeus-sans text-sm text-red-700">
                    {projectError}
                </p>
            ) : null}
            {error && !submitted && !projectError && Object.keys(fieldErrors).length === 0 ? (
                <p role="alert" className="font-dyeus-sans text-sm text-red-700">
                    Unable to send your enquiry. Please try again.
                </p>
            ) : null}
        </div>
    );
}

const DyeusMarketingContactForm = compose(
    withAxios<MarketingContactFormResponseType, MarketingContactFormType>(
        {method: "post", url: "/api/realEstate/marketingContact", data: {}},
        true,
    ),
    withDebug(true, true),
)(DyeusMarketingContactFormInner) as unknown as React.ComponentType<DyeusMarketingContactFormProps>;

export default DyeusMarketingContactForm;
