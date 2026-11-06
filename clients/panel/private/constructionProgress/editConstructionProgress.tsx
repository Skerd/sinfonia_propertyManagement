import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editConstructionProgressFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionProgress/editConstructionProgress.form.validator.ts";
import type {ConstructionProgress} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionProgress/constructionProgress.dto.ts";
import type {EditConstructionProgressFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionProgress/constructionProgress.schema-def.ts";
import {calendarDay, mediaEditPayload, refId, refIds} from "@propertyManagementModule/helpers/forms/editPageMapping.ts";

export default createGenericEditPage<ConstructionProgress, EditConstructionProgressFormType>({
    languagePath: "src/modules/propertyManagement/clients/panel/private/constructionProgress/editConstructionProgress.tsx",
    model: "constructionprogresses",
    apiUrl: "/api/realEstate/constructionProgress",
    schema: editConstructionProgressFormSchema,
    mapEntityData: (data) => ({
        ...data,
        project: refId(data.project),
        edifice: refId(data.edifice),
        updateDate: calendarDay(data.updateDate),
        expectedCompletionDate: calendarDay(data.expectedCompletionDate),
        photos: refIds(data.photos),
    }),
    buildFormExtras: (_entityId, _params, entity) => ({
        enableLocalFileMultipart: true,
        editMediaExistingList: entity?.photos ?? [],
    }),
    mapSubmitPayload: (data, {writeFields}) => mediaEditPayload(data, writeFields, "photos"),
    submitIcon: <IconDeviceFloppy />,
});
