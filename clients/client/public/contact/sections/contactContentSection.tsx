import {figmaAssets} from "@propertyManagementModule/clients/client/public/shared/figmaAssets.ts";
import {contactAssets} from "@propertyManagementModule/clients/client/public/contact/contactAssets.ts";
import {PublicLanguageProps} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";
import {PUBLIC_SUBTITLE, PUBLIC_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

function ContactContentSection({resolveLanguageKey}: PublicLanguageProps) {
    return (
        <div className="relative grid w-full grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12" data-node-id="305:228">
            <div className="min-w-0" data-node-id="320:583">
                <h1 className={`max-w-lg ${PUBLIC_TITLE}`}>{resolveLanguageKey("title")}</h1>
                <div className="mt-8 flex flex-col gap-6 md:mt-10" data-node-id="320:570">
                    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                        <input
                            type="text"
                            placeholder={resolveLanguageKey("namePlaceholder")}
                            className="flex-1 rounded-[5px] border border-pronix-border px-4 py-4 font-aeonik-light text-base text-pronix-ink outline-none md:text-lg"
                        />
                        <input
                            type="text"
                            placeholder={resolveLanguageKey("lastNamePlaceholder")}
                            className="flex-1 rounded-[5px] border border-pronix-border px-4 py-4 font-aeonik-light text-base text-pronix-ink outline-none md:text-lg"
                        />
                    </div>
                    <input
                        type="email"
                        placeholder={resolveLanguageKey("emailPlaceholder")}
                        className="w-full rounded-[5px] border border-pronix-border px-4 py-4 font-aeonik-light text-base text-pronix-ink outline-none md:text-lg"
                    />
                    <input
                        type="tel"
                        placeholder={resolveLanguageKey("phonePlaceholder")}
                        className="w-full rounded-[5px] border border-pronix-border px-4 py-4 font-aeonik-light text-base text-pronix-ink outline-none md:text-lg"
                    />
                    <select
                        className="w-full rounded-[5px] border border-pronix-border px-4 py-4 font-aeonik-light text-base text-pronix-ink-muted outline-none md:text-lg"
                        defaultValue=""
                    >
                        <option value="" disabled>
                            {resolveLanguageKey("interestPlaceholder")}
                        </option>
                    </select>
                    <textarea
                        placeholder={resolveLanguageKey("messagePlaceholder")}
                        className="min-h-[100px] w-full resize-none rounded-[5px] border border-pronix-border px-4 py-4 font-aeonik-light text-base text-pronix-ink outline-none md:text-lg"
                    />
                </div>
                <button
                    type="button"
                    className="mt-6 w-full rounded-[5px] bg-pronix-blue py-4 font-aeonik-medium text-base text-white not-italic transition hover:opacity-90 md:text-lg"
                >
                    {resolveLanguageKey("send")}
                </button>
                <div className="mt-10 flex flex-col gap-8" data-node-id="320:586">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2" data-node-id="320:587">
                        <div data-node-id="320:588">
                            <p className="font-aeonik-light text-sm text-pronix-ink-muted not-italic md:text-base leading-[1.4]">
                                {resolveLanguageKey("phoneLabel")}
                            </p>
                            <p className={`mt-3 font-aeonik-medium ${PUBLIC_SUBTITLE} text-pronix-ink`}>
                                {resolveLanguageKey("phoneValue")}
                            </p>
                        </div>
                        <div data-node-id="320:591">
                            <p className="font-aeonik-light text-sm text-pronix-ink-muted not-italic md:text-base leading-[1.4]">
                                {resolveLanguageKey("emailLabel")}
                            </p>
                            <p className={`mt-3 font-aeonik-medium ${PUBLIC_SUBTITLE} text-pronix-ink`}>
                                {resolveLanguageKey("emailValue")}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2" data-node-id="320:594">
                        <div data-node-id="320:595">
                            <p className="font-aeonik-light text-sm text-pronix-ink-muted not-italic md:text-base leading-[1.4]">
                                {resolveLanguageKey("addressLabel")}
                            </p>
                            <p className={`mt-3 font-aeonik-medium ${PUBLIC_SUBTITLE} text-pronix-ink`}>
                                {resolveLanguageKey("addressValue")}
                            </p>
                        </div>
                        <div data-node-id="320:598">
                            <p className="font-aeonik-light text-sm text-pronix-ink-muted not-italic md:text-base leading-[1.4]">
                                {resolveLanguageKey("hoursLabel")}
                            </p>
                            <p className={`mt-3 font-aeonik-medium ${PUBLIC_SUBTITLE} text-pronix-ink`}>
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
                    className="absolute bottom-4 left-4 size-40 rounded-[5px] backdrop-blur-[47px] md:bottom-6 md:left-6 md:size-[239px]"
                    style={{background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)"}}
                >
                    <img alt="" aria-hidden className="absolute left-4 top-4 size-10 md:left-5 md:top-5 md:size-[50px]" src={figmaAssets.ctaEllipse} />
                    <p className="absolute bottom-4 left-4 right-4 font-aeonik-medium text-base text-white not-italic md:bottom-5 md:left-5 md:text-lg leading-[1.2]">
                        {resolveLanguageKey("findUs")}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ContactContentSection;
