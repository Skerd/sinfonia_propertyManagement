import {compose} from "redux";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";

function AboutPage() {
    return (
        <DyeusPageShell nodeId="44:about" nodeName="About">
            <div className="relative">
                <DyeusHeader variant="solid" />
                <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-28 md:px-12 md:pb-28 md:pt-36">
                    <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-bronze">About us</p>
                    <h1 className="mt-4 max-w-3xl font-dyeus-serif text-5xl leading-tight md:text-7xl">
                        A residence shaped by light, sea, and quiet confidence
                    </h1>
                    <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
                        <p className="font-dyeus-sans text-base leading-relaxed text-dyeus-ink-muted md:text-lg">
                            Dyeus Residence is conceived as a boutique coastal community — intimate in scale, generous
                            in outdoor living, and rooted in the landscape of the Albanian Riviera. Every terrace,
                            pool edge, and garden path is composed for slow Mediterranean days.
                        </p>
                        <p className="font-dyeus-sans text-base leading-relaxed text-dyeus-ink-muted md:text-lg">
                            Beyond architecture, Dyeus is an investment in place: privacy without isolation, hospitality
                            without noise, and a lasting address where nature still leads the composition.
                        </p>
                    </div>
                    <div className="mt-16 grid gap-4 md:grid-cols-2">
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <img src={dyeusAssets.architecture} alt="" className="size-full object-cover" />
                        </div>
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <img src={dyeusAssets.lounge} alt="" className="size-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>
            <DyeusFooter />
        </DyeusPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/about/index.tsx"),
    withDebug(true, true),
)(AboutPage);
