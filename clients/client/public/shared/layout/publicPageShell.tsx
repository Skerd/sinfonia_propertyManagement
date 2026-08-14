import {type ReactNode} from "react";

type PublicPageShellProps = {
    nodeId: string;
    nodeName: string;
    children: ReactNode;
};

function PublicPageShell({nodeId, nodeName, children}: PublicPageShellProps) {
    return (
        <div
            className="public-page-shell relative min-h-screen min-w-0 w-full max-w-full cursor-default overflow-x-hidden bg-white"
            data-node-id={nodeId}
            data-name={nodeName}
        >
            {children}
        </div>
    );
}

export default PublicPageShell;
