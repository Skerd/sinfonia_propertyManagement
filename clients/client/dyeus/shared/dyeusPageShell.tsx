import {type ReactNode} from "react";

type DyeusPageShellProps = {
    nodeId: string;
    nodeName: string;
    children: ReactNode;
};

function DyeusPageShell({nodeId, nodeName, children}: DyeusPageShellProps) {
    return (
        <div
            className="relative min-h-screen min-w-0 w-full overflow-x-hidden bg-dyeus-cream [scrollbar-gutter:stable]"
            data-node-id={nodeId}
            data-name={nodeName}
        >
            {children}
        </div>
    );
}

export default DyeusPageShell;
