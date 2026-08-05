import {compose} from "redux";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";

const images = [
    dyeusAssets.hero,
    dyeusAssets.villaPool,
    dyeusAssets.terrace,
    dyeusAssets.interior,
    dyeusAssets.architecture,
    dyeusAssets.lounge,
    dyeusAssets.night,
    dyeusAssets.coastline,
    dyeusAssets.lifestyle,
] as const;

function GalleryPage() {
    return (
        <DyeusPageShell nodeId="44:gallery" nodeName="Gallery">
            <div className="relative">
                <DyeusHeader variant="solid" />
                <div className="mx-auto max-w-[1440px] px-6 pb-16 pt-28 md:px-12 md:pt-36">
                    <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-bronze">Gallery</p>
                    <h1 className="mt-4 font-dyeus-serif text-5xl md:text-7xl">Spaces &amp; atmosphere</h1>
                    <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
                        {images.map((src) => (
                            <div key={src} className="mb-4 break-inside-avoid overflow-hidden">
                                <img src={src} alt="" className="w-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <DyeusFooter />
        </DyeusPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/gallery/index.tsx"),
    withDebug(true, true),
)(GalleryPage);
