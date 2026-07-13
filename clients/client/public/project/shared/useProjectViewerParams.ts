import {useSearchParams} from "react-router-dom";

export function useProjectViewerParams() {
    const [searchParams] = useSearchParams();
    return {
        projectId: searchParams.get("projectId") ?? "",
        edificeId: searchParams.get("edificeId") ?? "",
        floorId: searchParams.get("floorId") ?? "",
    };
}
