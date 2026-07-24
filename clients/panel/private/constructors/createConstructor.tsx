import {IconBackhoe} from "@tabler/icons-react";
import {z} from "zod";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createConstructorFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructor/createConstructor.form.validator.ts";
import type {CreateConstructorFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructor/constructor.schema-def.ts";

type CreateConstructorFormSurface = CreateConstructorFormType & {logo?: File};

export default createGenericCreatePage<CreateConstructorFormSurface>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/constructors/createConstructor.tsx",
    model: "constructors",
    apiUrl: "/api/realEstate/constructor",
    schema: (languageCode, form) => createConstructorFormSchema(languageCode, form).extend({logo: z.instanceof(File).optional()}),
    defaultValues: {
        name: "",
        vat: "",
    },
    mapSubmitPayload: (data) => {
        const postBody: CreateConstructorFormType = {
            name: data.name,
            email: data.email,
            phoneNumber: data.phoneNumber,
            description: data.description,
            website: data.website,
            vat: data.vat,
            partyType: data.partyType,
            trades: data.trades,
            insuranceExpiry: data.insuranceExpiry,
            performanceScore: data.performanceScore,
            addresses: (data.addresses || []).map((address) => ({
                street: address.street,
                postalCode: address.postalCode,
                city: address.city,
                state: address.state,
                country: address.country,
                latitude: address.latitude,
                longitude: address.longitude,
            })),
        };
        const formData = new FormData();
        if (data.logo instanceof File) {
            formData.append("files", data.logo);
        }
        formData.append("data", JSON.stringify(postBody));
        return formData;
    },
    submitIcon: <IconBackhoe />,
});
