import {compose} from "redux";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import DyeusMarketingContactForm from "@propertyManagementModule/clients/client/dyeus/shared/dyeusMarketingContactForm.tsx";

function ContactPage() {
    return (
        <DyeusPageShell nodeId="44:contact" nodeName="Contact">
            <div className="relative">
                <DyeusHeader variant="solid" />
                <div className="mx-auto grid max-w-[1440px] gap-12 px-6 pb-20 pt-28 md:px-12 md:pb-28 md:pt-36 lg:grid-cols-2">
                    <div>
                        <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-bronze">Contact</p>
                        <h1 className="mt-4 font-dyeus-serif text-5xl md:text-7xl">Begin the conversation</h1>
                        <p className="mt-6 max-w-md font-dyeus-sans text-base leading-relaxed text-dyeus-ink-muted">
                            Share a few details and our team will arrange a private introduction to Dyeus Residence.
                        </p>
                    </div>
                    <DyeusMarketingContactForm className="bg-dyeus-white p-6 md:p-8" />
                </div>
            </div>
            <DyeusFooter />
        </DyeusPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/contact/index.tsx"),
    withDebug(true, true),
)(ContactPage);
