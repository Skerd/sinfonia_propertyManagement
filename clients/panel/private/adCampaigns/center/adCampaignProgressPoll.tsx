import {useEffect, useRef, useState} from "react";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import type {AdCampaign} from "armonia/src/modules/propertyManagement/api/realEstate/private/adCampaign/adCampaign.dto.ts";

const CAMPAIGN_REQUEST: HttpRequest = {method: "post", url: "/api/realEstate/adCampaign/single"};

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

    // One refresh every 4 s while the campaign is in flight.
    const [tick, setTick] = useState(0);
    const polling = enabled && !!entityId && (status === "sending" || status === "scheduled");
    useEffect(() => {
        if (!polling) return;
        const timer = setInterval(() => setTick((count) => count + 1), 4000);
        return () => clearInterval(timer);
    }, [polling, entityId]);
    useHttpRequest<AdCampaign>(CAMPAIGN_REQUEST, {_id: entityId}, polling ? tick : 0, true, {
        success: (data) => onPatchedRef.current(data),
    });
    return null;
}
