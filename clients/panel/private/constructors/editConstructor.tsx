import {z} from "zod";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editConstructorFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructor/editConstructor.form.validator.ts";
import type {Constructor} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructor/constructor.dto.ts";
import type {EditConstructorFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructor/constructor.schema-def.ts";

type EditConstructorFormSurface = Omit<EditConstructorFormType, "logo"> & {logo?: File | string};

export default createGenericEditPage<Constructor, EditConstructorFormSurface>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/constructors/editConstructor.tsx",
    model: "constructors",
    apiUrl: "/api/realEstate/constructor",
    schema: (languageCode, form, writeFields, readFields) => editConstructorFormSchema(languageCode, form, writeFields, readFields).extend({logo: z.union([z.instanceof(File), z.string()]).optional()}),
    mapEntityData: (data) => ({
        ...data,
        addresses: data.addresses?.map((addr) => ({
            street: addr.street,
            postalCode: addr.postalCode,
            city: (addr.city as any)?._id,
            state: (addr.state as any)?._id,
            country: (addr.country as any)?._id,
            latitude: addr.latitude ?? 41.3275,
            longitude: addr.longitude ?? 19.8189,
        })),
        logo: data.logo && typeof data.logo === "object" && "_id" in data.logo
            ? (data.logo as {_id: string})._id
            : typeof data.logo === "string" ? data.logo : undefined,
    }),
    mapSubmitPayload: (data, {writeFields}) => {
        const postBody: EditConstructorFormType = {
            _id: data._id,
            name: data.name,
            vat: data.vat,
            email: writeFields.email ? data.email : undefined,
            phoneNumber: writeFields.phoneNumber ? data.phoneNumber : undefined,
            description: writeFields.description ? data.description : undefined,
            website: writeFields.website ? data.website : undefined,
            partyType: writeFields.partyType ? data.partyType : undefined,
            trades: writeFields.trades ? data.trades : undefined,
            insuranceExpiry: writeFields.insuranceExpiry ? data.insuranceExpiry : undefined,
            performanceScore: writeFields.performanceScore ? data.performanceScore : undefined,
            addresses: writeFields.addresses ? data.addresses : undefined,
        };
        const formData = new FormData();
        if (writeFields.logo && data.logo instanceof File) {
            formData.append("files", data.logo);
        }
        formData.append("data", JSON.stringify(postBody));
        return formData;
    },
});
