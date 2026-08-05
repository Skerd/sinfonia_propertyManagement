import React, {useEffect, useImperativeHandle, useRef, useState} from "react";
import {Link} from "react-router-dom";
import {compose} from "redux";
import {cn} from "@coreModule/components/lib/utils.ts";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {FIGMA_FOOTER_SECTION} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {
    PUBLIC_CONTENT_FRAME,
    PUBLIC_GRID_FOOTER_LINKS,
    PUBLIC_GRID_FOOTER_MAIN,
    PUBLIC_SECTION_BASE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";
import type {MarketingCompanyResponse} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
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
    "w-full min-w-0 cursor-text border-0 bg-transparent font-aeonik-medium text-white outline-none placeholder:text-white/50";

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
    return (
        <div
            className="flex min-w-0 flex-col items-start not-italic text-white"
            style={{gap: linkItemGap}}
            data-node-id={nodeId}
        >
            <p
                className="font-aeonik-medium w-full min-w-0 cursor-default leading-normal"
                style={{fontSize: `min(${titleFontCqwCap}cqw, 32px)`}}
            >
                {title}
            </p>
            {links.map((link) => {
                const className = cn(
                    "font-aeonik-light w-full min-w-0 cursor-pointer leading-normal",
                    footerLinkHoverClass,
                );
                const style = {fontSize: `min(${linkFontCqwCap}cqw, 24px)`};
                if (link.to) {
                    return (
                        <Link key={link.label} to={link.to} className={className} style={style}>
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
                            className={className}
                            style={style}
                        >
                            {link.label}
                        </a>
                    );
                }
                return (
                    <span key={link.label} className={className} style={style}>
                        {link.label}
                    </span>
                );
            })}
        </div>
    );
}

function FooterContactRow({email, phoneNumber}: {email?: string; phoneNumber?: string}) {
    if (!email && !phoneNumber) {
        return null;
    }

    const contactClass = cn(
        "font-aeonik-medium cursor-pointer whitespace-nowrap not-italic leading-normal",
        footerLinkHoverClass,
    );

    return (
        <div
            className="flex min-w-0 flex-wrap items-center gap-[min(1.13cqw,18.6px)]"
            data-node-id="357:2457"
        >
            {email ? (
                <a
                    href={`mailto:${email}`}
                    className={contactClass}
                    style={{fontSize: `min(${contactFontCqwCap}cqw, 24px)`}}
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
                    style={{fontSize: `min(${contactFontCqwCap}cqw, 24px)`}}
                    data-node-id="357:2460"
                >
                    {phoneNumber}
                </a>
            ) : null}
        </div>
    );
}

type ContactFieldKey = keyof MarketingContactFormType;
type ContactFieldErrors = Partial<Record<ContactFieldKey, string>>;

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateContactForm(values: MarketingContactFormType): ContactFieldErrors {
    const errors: ContactFieldErrors = {};
    if (!values.name.trim()) errors.name = "Name is required.";
    if (!values.surname.trim()) errors.surname = "Surname is required.";
    if (!values.email.trim()) {
        errors.email = "Email is required.";
    } else if (!isValidEmail(values.email.trim())) {
        errors.email = "Enter a valid email.";
    }
    if (!values.phone.trim()) errors.phone = "Number is required.";
    if (!values.message.trim()) errors.message = "Message is required.";
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
}: {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    hasError?: boolean;
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
                Number
            </label>
            <input
                id="footer-number"
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder=" "
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                aria-invalid={hasError || undefined}
                className={cn(fieldInputClass, "peer leading-[17.15px]")}
                style={{fontSize: `min(${fieldFontCqwCap}cqw, 20px)`}}
            />
            <span
                aria-hidden
                className="pointer-events-none absolute left-[min(0.61cqw,10px)] font-aeonik-medium not-italic leading-[17.15px] text-white peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden"
                style={{fontSize: `min(${fieldFontCqwCap}cqw, 20px)`}}
            >
                <span className="uppercase">n</span>
                <span>umber</span>
            </span>
        </div>
    );
}

type FooterContactFormProps = WithAxiosType<MarketingContactFormResponseType, MarketingContactFormType>;

function FooterContactFormInner({onPost, loading, innerRef, error}: FooterContactFormProps) {
    const fieldPad = "px-[min(0.61cqw,10px)] py-[min(1.46cqw,24px)]";
    const fieldText = {fontSize: `min(${fieldFontCqwCap}cqw, 20px)`};
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
        const errors = validateContactForm(values);
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;
        onPost(values);
    };

    return (
        <div
            className="order-1 flex min-w-0 flex-col items-start lg:order-2"
            style={{gap: `min(${formIntroGapCqwCap}cqw, 32px)`}}
            data-node-id="357:2461"
        >
            <p
                className="font-aeonik-medium min-w-0 cursor-default not-italic leading-[1.2] text-white"
                style={{fontSize: `min(${introFontCqwCap}cqw, 24px)`}}
                data-node-id="357:2462"
            >
                {`Get in touch and let's talk about where you want to go.`}
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
                                    placeholder="Name"
                                    value={name}
                                    disabled={loading}
                                    aria-invalid={!!fieldErrors.name || undefined}
                                    onChange={(e) => {
                                        setSubmitted(false);
                                        clearFieldError("name");
                                        setName(e.target.value);
                                    }}
                                    className={cn(fieldInputClass, "leading-[17.15px]")}
                                    style={fieldText}
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
                                    placeholder="Surname"
                                    value={surname}
                                    disabled={loading}
                                    aria-invalid={!!fieldErrors.surname || undefined}
                                    onChange={(e) => {
                                        setSubmitted(false);
                                        clearFieldError("surname");
                                        setSurname(e.target.value);
                                    }}
                                    className={cn(fieldInputClass, "leading-[17.15px]")}
                                    style={fieldText}
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
                                placeholder="Email"
                                value={email}
                                disabled={loading}
                                aria-invalid={!!fieldErrors.email || undefined}
                                onChange={(e) => {
                                    setSubmitted(false);
                                    clearFieldError("email");
                                    setEmail(e.target.value);
                                }}
                                className={cn(fieldInputClass, "leading-[17.15px]")}
                                style={fieldText}
                            />
                        </div>
                        <FieldError message={fieldErrors.email} />
                    </div>
                    <div className="w-full min-w-0">
                        <FooterNumberField
                            value={phone}
                            disabled={loading}
                            hasError={!!fieldErrors.phone}
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
                                placeholder="Message"
                                rows={3}
                                value={message}
                                disabled={loading}
                                aria-invalid={!!fieldErrors.message || undefined}
                                onChange={(e) => {
                                    setSubmitted(false);
                                    clearFieldError("message");
                                    setMessage(e.target.value);
                                }}
                                className={cn(fieldInputClass, "min-h-[4.5rem] resize-none leading-[17.15px]")}
                                style={fieldText}
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
                        "flex w-full min-w-0 cursor-pointer items-center justify-center border border-white px-[min(2.91cqw,48px)] py-[min(0.97cqw,16px)]",
                        "bg-transparent text-white transition-colors duration-200",
                        "hover:bg-white hover:text-pronix-blue",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-pronix-blue",
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-white",
                    )}
                    data-node-id="357:2473"
                >
                    <span
                        className="font-aeonik-medium whitespace-nowrap not-italic leading-[17.15px]"
                        style={{fontSize: `min(${sendFontCqwCap}cqw, 24px)`}}
                    >
                        {loading ? "Sending…" : "Send"}
                    </span>
                </button>
                {submitted ? (
                    <p
                        role="status"
                        className="font-aeonik-medium w-full min-w-0 text-left leading-[1.3] text-white/90"
                        style={{fontSize: `min(${fieldFontCqwCap}cqw, 18px)`}}
                    >
                        Thanks — we received your message and will get back to you soon.
                    </p>
                ) : null}
                {error && !submitted && Object.keys(fieldErrors).length === 0 ? (
                    <p
                        role="alert"
                        className="font-aeonik-medium w-full min-w-0 text-left leading-[1.3] text-red-200"
                        style={{fontSize: `min(${fieldFontCqwCap}cqw, 18px)`}}
                    >
                        Something went wrong. Please try again.
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
)(FooterContactFormInner) as unknown as React.ComponentType;

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

type FooterSectionProps = WithAxiosType<MarketingCompanyResponse>;

function FooterSectionInner({data, onFilterChange}: FooterSectionProps) {
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
            style={{paddingTop: `min(${sectionPadCqwCap}cqw, 53px)`, paddingBottom: `min(${sectionPadCqwCap}cqw, 53px)`}}
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
                style={{gap: `min(${headlineGapCqwCap}cqw, 44px)`}}
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
                        className="order-2 flex min-w-0 flex-col justify-between gap-10 lg:order-1 lg:gap-16"
                        data-node-id="357:2440"
                    >
                        <div
                            className={PUBLIC_GRID_FOOTER_LINKS}
                            style={{columnGap: `min(${linkColGapCqwCap}cqw, 156px)`}}
                            data-node-id="357:2441"
                        >
                            <FooterLinkColumn
                                nodeId="357:2442"
                                title="Explore"
                                links={[
                                    {label: "Properties", to: "/projects"},
                                    {label: "About Pronix", to: "/about"},
                                    {label: "How it works"},
                                    {label: "For developers", to: "/developers"},
                                ]}
                            />
                            {socialLinks.length > 0 ? (
                                <FooterLinkColumn
                                    nodeId="357:2448"
                                    title="Social"
                                    links={socialLinks}
                                />
                            ) : null}
                            <FooterLinkColumn
                                nodeId="357:2453"
                                title="Support"
                                links={[
                                    {label: "Privacy Policy"},
                                    {label: "Terms of Conditions"},
                                ]}
                            />
                        </div>
                        <FooterContactRow email={data?.email} phoneNumber={data?.phoneNumber} />
                    </div>

                    <FooterContactForm />
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
)(FooterSectionInner) as unknown as React.ComponentType;
