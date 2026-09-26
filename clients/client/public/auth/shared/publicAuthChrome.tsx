import {type ReactNode} from "react";
import {cn} from "@coreModule/components/lib/utils.ts";
import PublicPageShell from "@propertyManagementModule/clients/client/public/shared/layout/publicPageShell.tsx";
import PublicSection from "@propertyManagementModule/clients/client/public/shared/layout/publicSection.tsx";
import PageHeaderSection from "@propertyManagementModule/clients/client/public/shared/sections/pageHeaderSection.tsx";
import FooterSection from "@propertyManagementModule/clients/client/public/shared/sections/footerSection.tsx";
import {PUBLIC_CONTENT_FRAME, PUBLIC_SUBTITLE, PUBLIC_TITLE} from "@propertyManagementModule/clients/client/public/shared/layout/publicLayoutTokens.ts";

export const AUTH_FIELD_INPUT_CLASS =
    "w-full min-w-0 cursor-text border-0 bg-transparent font-aeonik-light text-[20px] leading-[17.15px] tracking-normal text-pronix-ink outline-none placeholder:text-pronix-ink/50 md:text-lg md:leading-none disabled:cursor-not-allowed disabled:opacity-60";

export const AUTH_FIELD_SHELL_CLASS = "flex w-full min-w-0 items-center border-b border-pronix-ink/30 px-2.5 py-4";

export const AUTH_FIELD_SHELL_ERROR_CLASS = "border-red-500";

export const AUTH_SUBMIT_CLASS =
    "flex w-full min-w-0 cursor-pointer items-center justify-center rounded-[5px] border border-transparent bg-pronix-blue px-6 py-3 font-aeonik-medium text-base text-white not-italic leading-[17.15px] tracking-normal transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 md:text-lg lg:text-[24px]";

export const AUTH_LINK_CLASS =
    "font-aeonik-medium text-pronix-blue transition-opacity hover:opacity-70";

export function AuthFieldError({message}: {message?: string}) {
    if (!message) return null;
    return (
        <p role="alert" className="mt-2 font-aeonik-medium text-sm leading-[1.3] text-red-600">
            {message}
        </p>
    );
}

export function AuthStatusMessage({children, tone = "default"}: {children: ReactNode; tone?: "default" | "error" | "success"}) {
    return (
        <p
            role={tone === "error" ? "alert" : "status"}
            className={cn(
                "font-aeonik-medium text-base leading-[1.3]",
                tone === "error" ? "text-red-600" : tone === "success" ? "text-pronix-ink" : "text-pronix-ink-muted",
            )}
        >
            {children}
        </p>
    );
}

type PublicAuthPageShellProps = {
    nodeId: string;
    nodeName: string;
    title: string;
    subtitle?: string;
    children: ReactNode;
};

export function PublicAuthPageShell({nodeId, nodeName, title, subtitle, children}: PublicAuthPageShellProps) {
    return (
        <PublicPageShell nodeId={nodeId} nodeName={nodeName}>
            <PublicSection flush>
                <PageHeaderSection variant="light" />
            </PublicSection>
            <PublicSection className="pt-2 pb-16 md:pt-4 md:pb-20">
                <div className={cn(PUBLIC_CONTENT_FRAME, "max-w-xl")}>
                    <h1 className={PUBLIC_TITLE}>{title}</h1>
                    {subtitle ? <p className={cn(PUBLIC_SUBTITLE, "mt-4")}>{subtitle}</p> : null}
                    <div className="mt-10 md:mt-12">{children}</div>
                </div>
            </PublicSection>
            <PublicSection flush>
                <FooterSection />
            </PublicSection>
        </PublicPageShell>
    );
}
