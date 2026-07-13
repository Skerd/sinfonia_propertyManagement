import {cn} from "@coreModule/components/lib/utils.ts";
import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {FIGMA_FOOTER_SECTION} from "@propertyManagementModule/clients/client/public/shared/layout/figmaDimensions.ts";
import {
    PUBLIC_CONTENT_FRAME,
    PUBLIC_GRID_FOOTER_LINKS,
    PUBLIC_GRID_FOOTER_MAIN,
    PUBLIC_SECTION_BASE,
} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

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
    "w-full min-w-0 border-0 bg-transparent font-aeonik-medium text-white outline-none placeholder:text-white/50";

function FooterLinkColumn({
    title,
    links,
    nodeId,
}: {
    title: string;
    links: string[];
    nodeId: string;
}) {
    return (
        <div
            className="flex min-w-0 flex-col items-start not-italic text-white"
            style={{gap: linkItemGap}}
            data-node-id={nodeId}
        >
            <p
                className="font-aeonik-medium w-full min-w-0 leading-normal"
                style={{fontSize: `min(${titleFontCqwCap}cqw, 32px)`}}
            >
                {title}
            </p>
            {links.map((link) => (
                <p
                    key={link}
                    className="font-aeonik-light w-full min-w-0 leading-normal"
                    style={{fontSize: `min(${linkFontCqwCap}cqw, 24px)`}}
                >
                    {link}
                </p>
            ))}
        </div>
    );
}

function FooterContactRow() {
    return (
        <div
            className="flex min-w-0 flex-wrap items-center gap-[min(1.13cqw,18.6px)]"
            data-node-id="357:2457"
        >
            <p
                className="font-aeonik-medium whitespace-nowrap not-italic leading-normal text-white"
                style={{fontSize: `min(${contactFontCqwCap}cqw, 24px)`}}
                data-node-id="357:2458"
            >
                info@pronix.al
            </p>
            <div className="relative h-[31px] w-0 shrink-0">
                <img
                    alt=""
                    aria-hidden
                    className="absolute block size-full max-w-none"
                    src={figmaAssets.footerSeparator}
                    style={{left: -0.5, right: -0.5}}
                />
            </div>
            <p
                className="font-aeonik-medium whitespace-nowrap not-italic leading-normal text-white"
                style={{fontSize: `min(${contactFontCqwCap}cqw, 24px)`}}
                data-node-id="357:2460"
            >
                619-920-2814
            </p>
        </div>
    );
}

function FooterNumberField() {
    return (
        <div
            className="relative flex w-full min-w-0 items-center border-b border-white/50 px-[min(0.61cqw,10px)] py-[min(1.46cqw,24px)]"
            data-node-id="357:2469"
        >
            <label className="sr-only" htmlFor="footer-number">
                Number
            </label>
            <input
                id="footer-number"
                type="tel"
                autoComplete="tel"
                placeholder=" "
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

function FooterContactForm() {
    const fieldPad = "px-[min(0.61cqw,10px)] py-[min(1.46cqw,24px)]";
    const fieldText = {fontSize: `min(${fieldFontCqwCap}cqw, 20px)`};

    return (
        <div
            className="order-1 flex min-w-0 flex-col items-start lg:order-2"
            style={{gap: `min(${formIntroGapCqwCap}cqw, 32px)`}}
            data-node-id="357:2461"
        >
            <p
                className="font-aeonik-medium min-w-0 not-italic leading-[1.2] text-white"
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
                    <div
                        className={cn("flex w-full min-w-0 items-center border-b border-white/50", fieldPad)}
                        data-node-id="357:2465"
                    >
                        <input
                            type="text"
                            name="name"
                            autoComplete="name"
                            placeholder="Name"
                            className={cn(fieldInputClass, "leading-[17.15px]")}
                            style={fieldText}
                        />
                    </div>
                    <div
                        className={cn("flex w-full min-w-0 items-center border-b border-white/50", fieldPad)}
                        data-node-id="357:2467"
                    >
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            placeholder="Email"
                            className={cn(fieldInputClass, "leading-[17.15px]")}
                            style={fieldText}
                        />
                    </div>
                    <FooterNumberField />
                    <div
                        className={cn(
                            "flex min-h-[min(7.05cqw,116px)] w-full min-w-0 items-start border-b border-white/50",
                            fieldPad,
                        )}
                        data-node-id="357:2471"
                    >
                        <textarea
                            name="message"
                            placeholder="Message"
                            rows={3}
                            className={cn(fieldInputClass, "min-h-[4.5rem] resize-none leading-[17.15px]")}
                            style={fieldText}
                        />
                    </div>
                </div>
            </div>
            <button
                type="button"
                className="flex w-full min-w-0 items-center justify-center border border-white bg-transparent px-[min(2.91cqw,48px)] py-[min(0.97cqw,16px)]"
                data-node-id="357:2473"
            >
                <span
                    className="font-aeonik-medium whitespace-nowrap not-italic leading-[17.15px] text-white"
                    style={{fontSize: `min(${sendFontCqwCap}cqw, 24px)`}}
                >
                    Send
                </span>
            </button>
        </div>
    );
}

function FooterSection() {
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
                                links={["Properties", "About Pronix", "How it works", "For developers"]}
                            />
                            <FooterLinkColumn
                                nodeId="357:2448"
                                title="Social"
                                links={["Linkedin", "Instagram", "Facebook"]}
                            />
                            <FooterLinkColumn
                                nodeId="357:2453"
                                title="Support"
                                links={["Privacy Policy", "Terms of Conditions"]}
                            />
                        </div>
                        <FooterContactRow />
                    </div>

                    <FooterContactForm />
                </div>
            </div>
        </section>
    );
}

export default FooterSection;
