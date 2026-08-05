import {compose} from "redux";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";

const posts = [
    {
        title: "Morning light on the Riviera",
        excerpt: "How the Dyeus façade was oriented for soft sunrise and long golden evenings.",
        image: dyeusAssets.terrace,
    },
    {
        title: "A garden between sea and stone",
        excerpt: "Landscape notes on native planting, privacy hedges, and quiet paths.",
        image: dyeusAssets.lifestyle,
    },
    {
        title: "Owning a coastal address",
        excerpt: "Why boutique scale matters when the coastline itself is the amenity.",
        image: dyeusAssets.coastline,
    },
] as const;

function JournalPage() {
    return (
        <DyeusPageShell nodeId="44:journal" nodeName="Journal">
            <div className="relative">
                <DyeusHeader variant="solid" />
                <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-28 md:px-12 md:pb-28 md:pt-36">
                    <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-bronze">Journal</p>
                    <h1 className="mt-4 font-dyeus-serif text-5xl md:text-7xl">Stories from Dyeus</h1>
                    <div className="mt-14 grid gap-10 md:grid-cols-3">
                        {posts.map((post) => (
                            <article key={post.title} className="group">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt=""
                                        className="size-full object-cover transition duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <h2 className="mt-5 font-dyeus-serif text-2xl md:text-3xl">{post.title}</h2>
                                <p className="mt-3 font-dyeus-sans text-sm leading-relaxed text-dyeus-ink-muted">
                                    {post.excerpt}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
            <DyeusFooter />
        </DyeusPageShell>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/dyeus/journal/index.tsx"),
    withDebug(true, true),
)(JournalPage);
