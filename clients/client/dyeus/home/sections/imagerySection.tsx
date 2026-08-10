import {useEffect, type ComponentType} from "react";
import {compose} from "redux";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";
import {useDyeusProjectId} from "@propertyManagementModule/clients/client/dyeus/shared/useDyeusProjectId.ts";
import DyeusProjectPolygonViewer from "@propertyManagementModule/clients/client/dyeus/home/sections/dyeusProjectPolygonViewer.tsx";
import type {MarketingProjectSingle} from "@propertyManagementModule/clients/client/public/shared/publicTypes.ts";

type MarketingProjectSingleResponse = {project: MarketingProjectSingle};
type ImagerySectionProps = WithAxiosType<MarketingProjectSingleResponse, {projectId: string}>;

function ImagerySectionFallback() {
    return (
        <section className="relative w-full overflow-hidden">
            <div className="relative aspect-[1728/974] w-full overflow-hidden">
                <div className="absolute left-[-10.21%] top-[-105.38%] flex h-[298.18%] w-[135%] items-center justify-center">
                    <div className="relative h-full w-full -rotate-[0.52deg]">
                        <img
                            src={dyeusAssets.villaFeature}
                            alt=""
                            className="absolute inset-0 size-full object-cover object-center"
                        />
                    </div>
                </div>
                <p
                    aria-hidden
                    className="pointer-events-none absolute left-[10.13%] top-[15.91%] w-[67.25%] select-none font-dyeus-serif text-[clamp(4rem,18vw,19rem)] font-light leading-none tracking-[0.2em] text-dyeus-cream"
                >
                    DYEUS
                </p>
            </div>
        </section>
    );
}

function ImagerySectionInner({data, loading, onFilterChange, error}: ImagerySectionProps) {
    const {projectId, loading: resolvingProject} = useDyeusProjectId();
    const project = data?.project;

    useEffect(() => {
        if (projectId) {
            onFilterChange({projectId});
        }
        // onFilterChange identity changes every withAxios render — do not add to deps.
    }, [projectId]);

    if (resolvingProject || (loading && !project && projectId)) {
        return (
            <section className="relative flex min-h-[28rem] w-full items-center justify-center overflow-hidden bg-dyeus-sand">
                <Loader />
            </section>
        );
    }

    if (!projectId || error || !project) {
        return <ImagerySectionFallback />;
    }

    return (
        <section className="relative w-full overflow-hidden">
            <DyeusProjectPolygonViewer project={project} />
        </section>
    );
}

const ImagerySection = compose(
    withAxios<MarketingProjectSingleResponse, {projectId: string}>(
        {method: "post", url: "/api/realEstate/marketingProjectCatalog/single", data: {}},
        true,
    ),
    withDebug(true, true),
)(ImagerySectionInner) as unknown as ComponentType;

export default ImagerySection;
