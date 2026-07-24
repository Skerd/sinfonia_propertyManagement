import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {GRID_TRANSACTIONAL_WIDE} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";
import {IconPlus} from "@tabler/icons-react";
import type {ConsultantAppointment} from "armonia/src/modules/propertyManagement/api/realEstate/private/consultantAppointment/consultantAppointment.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ConsultantAppointmentCard from "@propertyManagementModule/clients/panel/private/consultantAppointments/center/cardView/consultantAppointmentCard.tsx";

interface Props extends WithLanguageType {
    projectId?: string;
    projectName?: string;
}

function buildEditPath(row: ConsultantAppointment) {
    const params = new URLSearchParams();
    params.set("consultantAppointmentId", row._id);
    if (row.name) params.set("consultantAppointmentName", row.name);
    return `/realEstate/consultantAppointments/edit?${params.toString()}`;
}

function AllConsultantAppointments({resolveLanguageKey, projectId}: Props) {
    return (
        <EntityListPage<ConsultantAppointment>
            apiUrl="/api/realEstate/consultantAppointment"
            collectionName="consultantappointments"
            accessModel="consultantappointments"
            tableConfigKey="consultantappointments"
            createPath="/realEstate/consultantAppointments/create"
            createIcon={<IconPlus className="h-4 w-4" />}
            createLanguageKey="createConsultantAppointment"
            buildEditPath={buildEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/propertyManagement/clients/panel/private/consultantAppointments/center/sheetView/consultantAppointmentSheetView.tsx"
            cardViewClassName={GRID_TRANSACTIONAL_WIDE}
            extraFilters={projectId ? {projectId} : undefined}
            renderCard={(row, onDelete, onRestore) => (
                <ConsultantAppointmentCard
                    entity={row}
                    onDelete={(r: ConsultantAppointment | undefined, response?: DeletedData) => onDelete(r, response)}
                    onRestore={() => onRestore(row)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/consultantAppointments/index.tsx"),
    withDebug(true, true),
)(AllConsultantAppointments);
