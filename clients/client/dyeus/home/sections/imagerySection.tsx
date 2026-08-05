import {dyeusAssets} from "@propertyManagementModule/clients/client/dyeus/shared/dyeusAssets.ts";

function ImagerySection() {
    return (
        <section className="grid gap-3 px-3 md:grid-cols-12 md:gap-4 md:px-4">
            <div className="relative aspect-[4/5] overflow-hidden md:col-span-7 md:aspect-[16/11]">
                <img src={dyeusAssets.villaPool} alt="" className="size-full object-cover" />
            </div>
            <div className="relative aspect-[4/5] overflow-hidden md:col-span-5 md:aspect-auto md:min-h-full">
                <img src={dyeusAssets.terrace} alt="" className="size-full object-cover" />
            </div>
        </section>
    );
}

export default ImagerySection;
