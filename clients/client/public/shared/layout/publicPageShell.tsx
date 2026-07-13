import {type ReactNode} from "react";

type PublicPageShellProps = {
    nodeId: string;
    nodeName: string;
    children: ReactNode;
};

function PublicPageShell({nodeId, nodeName, children}: PublicPageShellProps) {
    return (
        <div
            className="relative min-h-screen min-w-0 w-full overflow-x-hidden bg-white [scrollbar-gutter:stable]"
            data-node-id={nodeId}
            data-name={nodeName}
        >
            {children}
        </div>
    );
}

export default PublicPageShell;
