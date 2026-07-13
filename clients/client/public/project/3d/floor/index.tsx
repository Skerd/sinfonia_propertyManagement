import {useEffect, useMemo} from "react";
import {compose} from "redux";
import {useNavigate} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {useProjectViewerParams} from "@propertyManagementModule/clients/client/public/project/shared/useProjectViewerParams.ts";

type FloorRedirectPageProps = WithLanguageType;

function Project3dFloorRedirectPage(_props: FloorRedirectPageProps) {
    const navigate = useNavigate();
    const {projectId, edificeId, floorId} = useProjectViewerParams();

    const redirectTarget = useMemo(() => {
        if (!projectId) {
            return "/projects";
        }
        const params = new URLSearchParams({projectId});
        if (edificeId) {
            params.set("edificeId", edificeId);
        }
        if (floorId) {
            params.set("floorId", floorId);
        }
        return `/project/3d?${params.toString()}`;
    }, [projectId, edificeId, floorId]);

    useEffect(() => {
        navigate(redirectTarget, {replace: true});
    }, [navigate, redirectTarget]);

    return (
        <div className="flex min-h-[400px] items-center justify-center">
            <Loader />
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/client/public/project/3d/floor/index.tsx"),
    withDebug(true, true),
)(Project3dFloorRedirectPage);
