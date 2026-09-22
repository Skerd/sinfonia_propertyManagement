import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {formatDate} from "@coreModule/helpers/general/dateTime.ts";
import type {ConstructionProgress} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructionProgress/constructionProgress.dto.ts";
import ResendStaffNotificationsMenuItem from "@propertyManagementModule/components/custom/sale/resendStaffNotificationsMenuItem.tsx";

type ResendConstructionProgressNotificationsProps = WithLanguageType &
    WithAxiosType<{ok: true; recipients: number}, {_id: string}> & {
        constructionProgress: ConstructionProgress;
    };

const NOTIFIED_AT_FORMAT: Intl.DateTimeFormatOptions = {dateStyle: "medium", timeStyle: "short"};

/** Re-sends the progress notification + email (with site photos) to the clients of the report's units. */
function ResendConstructionProgressNotifications({
    constructionProgress,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    loading,
}: ResendConstructionProgressNotificationsProps) {
    const {clientsNotifiedAt, clientsNotifiedCount} = constructionProgress;
    const detail = clientsNotifiedAt
        ? String(resolveLanguageKey("lastNotified"))
              .replace("{date}", formatDate(clientsNotifiedAt, {format: NOTIFIED_AT_FORMAT}))
              .replace("{count}", String(clientsNotifiedCount ?? 0))
        : String(resolveLanguageKey("neverNotified"));

    return (
        <ResendStaffNotificationsMenuItem
            resolveLanguageKey={resolveLanguageKey}
            loading={loading}
            innerRef={innerRef}
            detail={detail}
            onConfirm={() => onFilterChange({_id: constructionProgress._id})}
        />
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/constructionProgress/center/actions/resendConstructionProgressNotifications.tsx"),
    withAxios(
        {
            method: "POST",
            url: "/api/realEstate/constructionProgress/resendClientNotifications",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "constructionprogresses"),
)(ResendConstructionProgressNotifications);
