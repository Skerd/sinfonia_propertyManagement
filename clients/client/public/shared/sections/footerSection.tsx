import React, {useEffect, useImperativeHandle, useRef, useState, type CSSProperties} from "react";
import {ChevronRight} from "lucide-react";
import {Link} from "react-router-dom";
import {compose} from "redux";
import {cn} from "@coreModule/components/lib/utils.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {FIGMA_FOOTER_SECTION, FIGMA_IMAGE_CROPS, figmaImageCropStyle} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {
    PUBLIC_CONTENT_FRAME,
    PUBLIC_GRID_FOOTER_LINKS,
    PUBLIC_GRID_FOOTER_MAIN,
    PUBLIC_SECTION_BASE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import type {MarketingCompanyResponse, PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import type {MarketingContactFormType} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingContact/marketingContact.form.validator";
import type {MarketingContactFormResponseType} from "armonia/src/modules/propertyManagement/api/realEstate/public/marketingContact/marketingContact.form.response.type";

const {
    headlineAspect,
    titleFontCqwCap,
    linkFontCqwCap,
    contactFontCqwCap,
    introFontCqwCap,
    fieldFontCqwCap,
    sendFontCqwCap,
    linkColGapCqwCap,
    headlineGapCqwCap,
    formFieldGapCqwCap,
    formIntroGapCqwCap,
    sectionPadCqwCap,
    linkItemGap,
} = FIGMA_FOOTER_SECTION;

const fieldInputClass =
    "w-full min-w-0 cursor-text border-0 bg-transparent font-aeonik-medium text-[20px] leading-[17.15px] tracking-normal text-white outline-none placeholder:text-white/50 lg:[font-size:var(--footer-field-fs)]";
const fieldFontSizeVar = {
    "--footer-field-fs": `min(${fieldFontCqwCap}cqw, 20px)`,
} as CSSProperties;

/** Matches figmaMenu white-on-blue nav: fade on hover so links read as interactive. */
const footerLinkHoverClass =
    "text-white transition-colors duration-200 hover:text-white/30 focus-visible:outline-none focus-visible:text-white/30";

type FooterNavLink = {
    label: string;
    /** Internal app route (react-router). */
    to?: string;
    /** External URL (social, etc.). */
    href?: string;
};

function FooterLinkColumn({
    title,
    links,
    nodeId,
}: {
    title: string;
    links: FooterNavLink[];
    nodeId: string;
}) {
    const [open, setOpen] = useState(false);
    const panelId = `${nodeId.replace(/:/g, "-")}-links`;
    const linkClassName = cn(
        "font-aeonik-light w-full min-w-0 cursor-pointer text-xl leading-none tracking-normal",
        "lg:leading-normal lg:[font-size:var(--footer-link-fs)]",
        footerLinkHoverClass,
    );
    const linkStyle = {"--footer-link-fs": `min(${linkFontCqwCap}cqw, 24px)`} as CSSProperties;

    return (
        <div
            className="flex w-full min-w-0 flex-col items-stretch not-italic text-white lg:items-start"
            style={{gap: linkItemGap}}
            data-node-id={nodeId}
        >
            <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((current) => !current)}
                className="flex w-full min-w-0 cursor-pointer items-center justify-between gap-4 bg-transparent p-0 text-left lg:pointer-events-none lg:cursor-default"
            >
                <span
                    className="font-aeonik-medium min-w-0 text-2xl leading-none tracking-normal text-white lg:[font-size:var(--footer-col-title-fs)]"
                    style={{"--footer-col-title-fs": `min(${titleFontCqwCap}cqw, 32px)`} as CSSProperties}
                >
                    {title}
                </span>
                <ChevronRight
                    aria-hidden
                    className={cn(
                        "size-6 shrink-0 text-white transition-transform duration-200 lg:hidden",
                        open && "rotate-90",
                    )}
                    strokeWidth={1.5}
                />
            </button>
            <div
                id={panelId}
                className={cn("flex w-full min-w-0 flex-col items-start", open ? "flex" : "hidden lg:flex")}
                style={{gap: linkItemGap}}
            >
                {links.map((link) => {
                    if (link.to) {
                        return (
                            <Link key={link.label} to={link.to} className={linkClassName} style={linkStyle}>
                                {link.label}
                            </Link>
                        );
                    }
                    if (link.href) {
                        return (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={linkClassName}
                                style={linkStyle}
                            >
                                {link.label}
                            </a>
                        );
                    }
                    return (
                        <span key={link.label} className={linkClassName} style={linkStyle}>
                            {link.label}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

function FooterContactRow({
    email,
    phoneNumber,
    heading,
}: {
    email?: string;
    phoneNumber?: string;
    heading: string;
}) {
    if (!email && !phoneNumber) {
        return null;
    }

    const contactClass = cn(
        "cursor-pointer whitespace-nowrap font-[family-name:var(--font-aeonik)] text-lg font-normal not-italic leading-none tracking-normal",
        "lg:font-aeonik-medium lg:leading-normal lg:[font-size:var(--footer-contact-fs)]",
        footerLinkHoverClass,
    );
    const contactStyle = {"--footer-contact-fs": `min(${contactFontCqwCap}cqw, 24px)`} as CSSProperties;

    return (
        <div className="mt-auto flex min-w-0 flex-col items-start gap-3 lg:gap-0" data-node-id="357:2457">
            <p className="font-aeonik-medium w-full min-w-0 text-2xl leading-none tracking-normal text-white lg:hidden">
                {heading}
            </p>
            <div className="flex min-w-0 flex-wrap items-center gap-[min(1.13cqw,18.6px)]">
            {email ? (
                <a
                    href={`mailto:${email}`}
                    className={contactClass}
                    style={contactStyle}
                    data-node-id="357:2458"
                >
                    {email}
                </a>
            ) : null}
            {email && phoneNumber ? (
                <div className="relative h-[31px] w-0 shrink-0">
                    <img
                        alt=""
                        aria-hidden
                        className="absolute block size-full max-w-none"
                        src={figmaAssets.footerSeparator}
                        style={{left: -0.5, right: -0.5}}
                    />
                </div>
            ) : null}
            {phoneNumber ? (
                <a
                    href={`tel:${phoneNumber.replace(/[^\d+]/g, "")}`}
                    className={contactClass}
                    style={contactStyle}
                    data-node-id="357:2460"
                >
                    {phoneNumber}
                </a>
            ) : null}
            </div>
            <Link
                to="/"
                className="relative mt-4 mb-1 block h-11 w-[220px] shrink-0 overflow-hidden sm:h-12 sm:w-[240px] lg:hidden"
                data-name="Logo"
            >
                <img
                    alt="Pronix"
                    className="absolute max-w-none"
                    src={figmaAssets.heroLogo}
                    style={figmaImageCropStyle(FIGMA_IMAGE_CROPS.menuLogo)}
                />
            </Link>
        </div>
    );
}

type ContactFieldKey = keyof MarketingContactFormType;
type ContactFieldErrors = Partial<Record<ContactFieldKey, string>>;

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateContactForm(
    values: MarketingContactFormType,
    resolveLanguageKey: PublicLanguageProps["resolveLanguageKey"],
): ContactFieldErrors {
    const errors: ContactFieldErrors = {};
    if (!values.name.trim()) errors.name = String(resolveLanguageKey("nameRequired"));
    if (!values.surname.trim()) errors.surname = String(resolveLanguageKey("surnameRequired"));
    if (!values.email.trim()) {
        errors.email = String(resolveLanguageKey("emailRequired"));
    } else if (!isValidEmail(values.email.trim())) {
        errors.email = String(resolveLanguageKey("emailInvalid"));
    }
    if (!values.phone.trim()) errors.phone = String(resolveLanguageKey("numberRequired"));
    if (!values.message.trim()) errors.message = String(resolveLanguageKey("messageRequired"));
    return errors;
}

function FieldError({message}: {message?: string}) {
    if (!message) return null;
    return (
        <p
            role="alert"
            className="font-aeonik-medium mt-2 w-full min-w-0 text-left leading-[1.3] text-red-200"
            style={{fontSize: `min(${fieldFontCqwCap}cqw, 16px)`}}
        >
            {message}
        </p>
    );
}

function FooterNumberField({
    value,
    onChange,
    disabled,
    hasError,
    placeholder,
}: {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    hasError?: boolean;
    placeholder: string;
}) {
    return (
        <div
            className={cn(
                "relative flex w-full min-w-0 items-center border-b px-[min(0.61cqw,10px)] py-[min(1.46cqw,24px)]",
                hasError ? "border-red-300" : "border-white/50",
            )}
            data-node-id="357:2469"
        >
            <label className="sr-only" htmlFor="footer-number">
                {placeholder}
            </label>
            <input
                id="footer-number"
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                aria-invalid={hasError || undefined}
                className={fieldInputClass}
                style={fieldFontSizeVar}
            />
        </div>
    );
}

type FooterContactFormProps = Pick<PublicLanguageProps, "resolveLanguageKey"> &
    WithAxiosType<MarketingContactFormResponseType, MarketingContactFormType>;

function FooterContactFormInner({resolveLanguageKey, onPost, loading, innerRef, error}: FooterContactFormProps) {
    const fieldPad = "px-[min(0.61cqw,10px)] py-[min(1.46cqw,24px)]";
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
    const [submitted, setSubmitted] = useState(false);

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setName("");
            setSurname("");
            setEmail("");
            setPhone("");
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
        const values: MarketingContactFormType = {
            name: name.trim(),
            surname: surname.trim(),
            email: email.trim(),
            phone: phone.trim(),
            message: message.trim(),
        };
        const errors = validateContactForm(values, resolveLanguageKey);
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;
        onPost(values);
    };

    return (
        <div
            className="order-1 flex min-w-0 flex-col items-start lg:order-2"
            style={{gap: `max(1.75rem, min(${formIntroGapCqwCap}cqw, 32px))`}}
            data-node-id="357:2461"
        >
            <p
                className="font-aeonik-medium min-w-0 cursor-default text-2xl not-italic leading-[1.2] tracking-normal text-white lg:[font-size:var(--footer-intro-fs)]"
                style={{"--footer-intro-fs": `min(${introFontCqwCap}cqw, 24px)`} as CSSProperties}
                data-node-id="357:2462"
            >
                {String(resolveLanguageKey("formIntro"))}
            </p>
            <div className="flex w-full min-w-0 flex-col items-start" data-node-id="357:2463">
                <div
                    className="flex w-full min-w-0 flex-col items-start"
                    style={{gap: `min(${formFieldGapCqwCap}cqw, 40px)`}}
                    data-node-id="357:2464"
                >
                    <div className="grid w-full min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8" data-node-id="357:2465">
                        <div className="min-w-0">
                            <div
                                className={cn(
                                    "flex w-full min-w-0 items-center border-b",
                                    fieldPad,
                                    fieldErrors.name ? "border-red-300" : "border-white/50",
                                )}
                            >
                                <input
                                    type="text"
                                    name="name"
                                    autoComplete="given-name"
                                    placeholder={String(resolveLanguageKey("namePlaceholder"))}
                                    value={name}
                                    disabled={loading}
                                    aria-invalid={!!fieldErrors.name || undefined}
                                    onChange={(e) => {
                                        setSubmitted(false);
                                        clearFieldError("name");
                                        setName(e.target.value);
                                    }}
                                    className={fieldInputClass}
                                    style={fieldFontSizeVar}
                                />
                            </div>
                            <FieldError message={fieldErrors.name} />
                        </div>
                        <div className="min-w-0">
                            <div
                                className={cn(
                                    "flex w-full min-w-0 items-center border-b",
                                    fieldPad,
                                    fieldErrors.surname ? "border-red-300" : "border-white/50",
                                )}
                            >
                                <input
                                    type="text"
                                    name="surname"
                                    autoComplete="family-name"
                                    placeholder={String(resolveLanguageKey("surnamePlaceholder"))}
                                    value={surname}
                                    disabled={loading}
                                    aria-invalid={!!fieldErrors.surname || undefined}
                                    onChange={(e) => {
                                        setSubmitted(false);
                                        clearFieldError("surname");
                                        setSurname(e.target.value);
                                    }}
                                    className={fieldInputClass}
                                    style={fieldFontSizeVar}
                                />
                            </div>
                            <FieldError message={fieldErrors.surname} />
                        </div>
                    </div>
                    <div className="w-full min-w-0" data-node-id="357:2467">
                        <div
                            className={cn(
                                "flex w-full min-w-0 items-center border-b",
                                fieldPad,
                                fieldErrors.email ? "border-red-300" : "border-white/50",
                            )}
                        >
                            <input
                                type="email"
                                name="email"
                                autoComplete="email"
                                placeholder={String(resolveLanguageKey("emailPlaceholder"))}
                                value={email}
                                disabled={loading}
                                aria-invalid={!!fieldErrors.email || undefined}
                                onChange={(e) => {
                                    setSubmitted(false);
                                    clearFieldError("email");
                                    setEmail(e.target.value);
                                }}
                                className={fieldInputClass}
                                style={fieldFontSizeVar}
                            />
                        </div>
                        <FieldError message={fieldErrors.email} />
                    </div>
                    <div className="w-full min-w-0">
                        <FooterNumberField
                            value={phone}
                            disabled={loading}
                            hasError={!!fieldErrors.phone}
                            placeholder={String(resolveLanguageKey("numberPlaceholder"))}
                            onChange={(value) => {
                                setSubmitted(false);
                                clearFieldError("phone");
                                setPhone(value);
                            }}
                        />
                        <FieldError message={fieldErrors.phone} />
                    </div>
                    <div className="w-full min-w-0" data-node-id="357:2471">
                        <div
                            className={cn(
                                "flex min-h-[min(7.05cqw,116px)] w-full min-w-0 items-start border-b",
                                fieldPad,
                                fieldErrors.message ? "border-red-300" : "border-white/50",
                            )}
                        >
                            <textarea
                                name="message"
                                placeholder={String(resolveLanguageKey("messagePlaceholder"))}
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
                                style={fieldFontSizeVar}
                            />
                        </div>
                        <FieldError message={fieldErrors.message} />
                    </div>
                </div>
            </div>
            <div className="flex w-full min-w-0 flex-col items-stretch gap-3">
                <button
                    type="button"
                    disabled={loading}
                    onClick={handleSend}
                    className={cn(
                        "flex w-full min-w-0 cursor-pointer items-center justify-center border border-white px-6 py-4 lg:px-[min(2.91cqw,48px)] lg:py-[min(0.97cqw,16px)]",
                        "bg-transparent text-white transition-colors duration-200",
                        "hover:bg-white hover:text-pronix-blue",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-pronix-blue",
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-white",
                    )}
                    data-node-id="357:2473"
                >
                    <span
                        className="font-aeonik-medium whitespace-nowrap text-[20px] not-italic leading-[17.15px] tracking-normal lg:[font-size:var(--footer-send-fs)]"
                        style={{"--footer-send-fs": `min(${sendFontCqwCap}cqw, 24px)`} as CSSProperties}
                    >
                        {loading ? String(resolveLanguageKey("sending")) : String(resolveLanguageKey("send"))}
                    </span>
                </button>
                {submitted ? (
                    <p
                        role="status"
                        className="font-aeonik-medium w-full min-w-0 text-left leading-[1.3] text-white/90"
                        style={{fontSize: `min(${fieldFontCqwCap}cqw, 18px)`}}
                    >
                        {String(resolveLanguageKey("formSuccess"))}
                    </p>
                ) : null}
                {error && !submitted && Object.keys(fieldErrors).length === 0 ? (
                    <p
                        role="alert"
                        className="font-aeonik-medium w-full min-w-0 text-left leading-[1.3] text-red-200"
                        style={{fontSize: `min(${fieldFontCqwCap}cqw, 18px)`}}
                    >
                        {String(resolveLanguageKey("formError"))}
                    </p>
                ) : null}
            </div>
        </div>
    );
}

const FooterContactForm = compose(
    withAxios<MarketingContactFormResponseType, MarketingContactFormType>(
        {method: "post", url: "/api/realEstate/marketingContact", data: {}},
        true,
    ),
    withDebug(true, true),
)(FooterContactFormInner) as unknown as React.ComponentType<Pick<PublicLanguageProps, "resolveLanguageKey">>;

function buildSocialLinks(data: MarketingCompanyResponse | null | undefined): FooterNavLink[] {
    if (!data) {
        return [];
    }
    const links: FooterNavLink[] = [];
    if (data.linkedin) {
        links.push({label: "Linkedin", href: data.linkedin});
    }
    if (data.instagram) {
        links.push({label: "Instagram", href: data.instagram});
    }
    if (data.facebook) {
        links.push({label: "Facebook", href: data.facebook});
    }
    return links;
}

type FooterSectionProps = PublicLanguageProps & WithAxiosType<MarketingCompanyResponse>;

function FooterSectionInner({data, onFilterChange, resolveLanguageKey}: FooterSectionProps) {
    const initialFetchDone = useRef(false);

    useEffect(() => {
        if (initialFetchDone.current) {
            return;
        }
        initialFetchDone.current = true;
        onFilterChange({});
        // Intentionally mount-only: onFilterChange identity changes every withAxios render.
    }, []);

    const socialLinks = buildSocialLinks(data);

    return (
        <section
            className={cn(
                PUBLIC_SECTION_BASE,
                "@container relative overflow-hidden bg-pronix-blue",
            )}
            style={{paddingTop: `max(3.5rem, min(${sectionPadCqwCap}cqw, 53px))`, paddingBottom: `max(1.25rem, min(${sectionPadCqwCap}cqw, 53px))`}}
            data-node-id="357:360"
        >
            <img
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 size-full object-cover"
                src={figmaAssets.footerBg}
            />
            <div
                className={cn(PUBLIC_CONTENT_FRAME, "relative z-10 flex min-w-0 flex-col")}
                style={{gap: `max(2.75rem, min(${headlineGapCqwCap}cqw, 44px))`}}
                data-node-id="357:2437"
            >
                <div className="relative w-full min-w-0" data-node-id="357:2438">
                    <img
                        alt="LET'S TALK"
                        className="block h-auto w-full object-contain object-left"
                        style={{aspectRatio: headlineAspect}}
                        src={figmaAssets.footerLetsTalk}
                    />
                </div>

                <div
                    className={cn(PUBLIC_GRID_FOOTER_MAIN, "lg:gap-[min(9.5cqw,156px)]")}
                    data-node-id="357:2439"
                >
                    <div
                        className="order-2 flex h-full min-w-0 flex-col justify-between gap-4 lg:order-1 lg:gap-16"
                        data-node-id="357:2440"
                    >
                        <div
                            className={PUBLIC_GRID_FOOTER_LINKS}
                            style={{columnGap: `min(${linkColGapCqwCap}cqw, 156px)`}}
                            data-node-id="357:2441"
                        >
                            <FooterLinkColumn
                                nodeId="357:2442"
                                title={String(resolveLanguageKey("explore"))}
                                links={[
                                    {label: String(resolveLanguageKey("linkProperties")), to: "/projects"},
                                    {label: String(resolveLanguageKey("linkAbout")), to: "/about"},
                                    {label: String(resolveLanguageKey("linkHowItWorks"))},
                                    {label: String(resolveLanguageKey("linkDevelopers")), to: "/developers"},
                                ]}
                            />
                            {socialLinks.length > 0 ? (
                                <FooterLinkColumn
                                    nodeId="357:2448"
                                    title={String(resolveLanguageKey("social"))}
                                    links={socialLinks}
                                />
                            ) : null}
                            <FooterLinkColumn
                                nodeId="357:2453"
                                title={String(resolveLanguageKey("support"))}
                                links={[
                                    {label: String(resolveLanguageKey("linkPrivacy")), to: "/privacy"},
                                    {label: String(resolveLanguageKey("linkTerms")), to: "/terms"},
                                ]}
                            />
                        </div>
                        <FooterContactRow
                            heading={String(resolveLanguageKey("contact"))}
                            email={data?.email}
                            phoneNumber={data?.phoneNumber}
                        />
                    </div>

                    <FooterContactForm resolveLanguageKey={resolveLanguageKey} />
                </div>
            </div>
        </section>
    );
}

export default compose(
    withAxios<MarketingCompanyResponse>(
        {method: "post", url: "/api/realEstate/marketingCompany", data: {}},
        true,
    ),
    withDebug(true, true),
    withLanguage("src/modules/propertyManagement/clients/client/public/shared/sections/footerSection.tsx"),
)(FooterSectionInner) as unknown as React.ComponentType;
