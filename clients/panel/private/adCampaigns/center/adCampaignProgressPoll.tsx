import {useEffect, useRef} from "react";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import type {AdCampaign} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.dto.ts";

type AdCampaignProgressPollProps = {
    entityId?: string;
    status?: string;
    enabled?: boolean;
    onPatched: (row: AdCampaign) => void;
};

/**
 * Refresh sent/total while a campaign is in flight.
 *
 * The drain runs in the background; without this the sheet and card would
 * keep the counts from when they were opened.
 */
export default function AdCampaignProgressPoll({
    entityId,
    status,
    enabled = true,
    onPatched,
}: AdCampaignProgressPollProps) {
    const onPatchedRef = useRef(onPatched);
    onPatchedRef.current = onPatched;

    useEffect(() => {
        if (!enabled || !entityId) return;
        if (status !== "sending" && status !== "scheduled") return;
        const tick = () => {
            apiClient
                .post<AdCampaign>("/api/realEstate/adCampaign/single", {_id: entityId})
                .then(({data}) => onPatchedRef.current(data))
                .catch(() => undefined);
        };
        const timer = setInterval(tick, 4000);
        return () => clearInterval(timer);
    }, [enabled, entityId, status]);
    return null;
}
