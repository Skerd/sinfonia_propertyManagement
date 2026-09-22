import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {ConstructionProgress} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionProgress/constructionProgress.dto.ts";
import ResendConstructionProgressNotifications from "@propertyManagementModule/clients/panel/private/constructionProgress/center/actions/resendConstructionProgressNotifications.tsx";

type ConstructionProgressRowMenuExtrasProps = {
    constructionProgress: ConstructionProgress;
};

/** Custom card / row / sheet menu items. View, Edit, Delete, Restore come from the action menu itself. */
export default function ConstructionProgressRowMenuExtras({constructionProgress}: ConstructionProgressRowMenuExtrasProps) {
    const {write} = useAccess("constructionprogresses");
    // Same gate as the server action (write access to `notifyClients`).
    const canNotify = write === true || (typeof write === "object" && write !== null && "notifyClients" in write);
    const isDeleted = constructionProgress.deletedAt != null || constructionProgress.deletedBy != null;
    if (!canNotify || isDeleted || !constructionProgress._id) return null;

    return <ResendConstructionProgressNotifications constructionProgress={constructionProgress} />;
}
