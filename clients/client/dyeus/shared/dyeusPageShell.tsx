import {type ReactNode} from "react";

type DyeusPageShellProps = {
    nodeId: string;
    nodeName: string;
    className?: string;
    children: ReactNode;
};

function DyeusPageShell({nodeId, nodeName, className = "", children}: DyeusPageShellProps) {
    return (
        <div
            className={`relative min-h-screen min-w-0 w-full overflow-x-hidden bg-dyeus-cream [scrollbar-gutter:stable] ${className}`}
            data-node-id={nodeId}
            data-name={nodeName}
        >
            {children}
        </div>
    );
}

export default DyeusPageShell;
