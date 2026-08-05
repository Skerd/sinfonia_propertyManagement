import {Outlet} from "react-router-dom";
import DyeusScrollToTop from "@propertyManagementModule/clients/client/dyeus/shared/dyeusScrollToTop.tsx";

function DyeusLayout() {
    return (
        <>
            <DyeusScrollToTop />
            <div className="min-h-screen bg-dyeus-cream text-dyeus-ink">
                <Outlet />
            </div>
        </>
    );
}

export default DyeusLayout;
