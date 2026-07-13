import {aboutAssets} from "@propertyManagementModule/clients/client/public/about/aboutAssets.ts";

function AboutVideoSection() {
    return (
        <div className="relative aspect-video w-full min-h-[240px] overflow-hidden rounded-[5px] md:min-h-[400px] lg:min-h-[520px]" data-node-id="368:4982">
            <img
                alt=""
                aria-hidden
                className="absolute inset-0 size-full object-cover"
                src={aboutAssets.videoBg}
                data-node-id="368:4983"
            />
            <img
                alt=""
                aria-hidden
                className="absolute inset-0 size-full object-cover"
                src={aboutAssets.videoScene}
                data-node-id="368:4992"
            />
            <img
                alt=""
                aria-hidden
                className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 md:size-24 lg:size-[120px]"
                src={aboutAssets.videoPlay}
                data-node-id="368:4984"
            />
        </div>
    );
}

export default AboutVideoSection;
