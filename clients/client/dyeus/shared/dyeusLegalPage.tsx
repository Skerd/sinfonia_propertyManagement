import DyeusPageShell from "@propertyManagementModule/clients/client/dyeus/shared/dyeusPageShell.tsx";
import DyeusHeader from "@propertyManagementModule/clients/client/dyeus/shared/dyeusHeader.tsx";
import DyeusFooter from "@propertyManagementModule/clients/client/dyeus/shared/dyeusFooter.tsx";

export type DyeusLegalSection = {
    title: string;
    body: string;
};

type DyeusLegalPageProps = {
    nodeId: string;
    nodeName: string;
    eyebrow: string;
    title: string;
    lastUpdated: string;
    intro: string;
    sections: readonly DyeusLegalSection[];
};

function DyeusLegalPage({
    nodeId,
    nodeName,
    eyebrow,
    title,
    lastUpdated,
    intro,
    sections,
}: DyeusLegalPageProps) {
    return (
        <DyeusPageShell nodeId={nodeId} nodeName={nodeName}>
            <div className="relative">
                <DyeusHeader variant="solid" />
                <article className="mx-auto max-w-[900px] px-6 pb-20 pt-28 md:px-12 md:pb-28 md:pt-36">
                    <p className="font-dyeus-sans text-xs uppercase tracking-[0.24em] text-dyeus-bronze">
                        {eyebrow}
                    </p>
                    <h1 className="mt-4 font-dyeus-serif text-5xl leading-tight md:text-7xl">{title}</h1>
                    <p className="mt-4 font-dyeus-sans text-sm text-dyeus-ink-muted">{lastUpdated}</p>
                    <p className="mt-8 font-dyeus-sans text-base leading-relaxed text-dyeus-ink-muted md:text-lg">
                        {intro}
                    </p>
                    <div className="mt-12 flex flex-col gap-10 md:gap-12">
                        {sections.map((section) => (
                            <section key={section.title}>
                                <h2 className="font-dyeus-serif text-2xl md:text-3xl">{section.title}</h2>
                                <p className="mt-3 whitespace-pre-line font-dyeus-sans text-base leading-relaxed text-dyeus-ink-muted">
                                    {section.body}
                                </p>
                            </section>
                        ))}
                    </div>
                </article>
            </div>
            <DyeusFooter />
        </DyeusPageShell>
    );
}

export default DyeusLegalPage;
