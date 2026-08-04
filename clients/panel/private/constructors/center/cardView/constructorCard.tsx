import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@coreModule/components/ui/avatar.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {IconBuilding, IconMail, IconMapPin, IconPhone} from "@tabler/icons-react";
import {Constructor} from "armonia/src/modules/propertyManagement/api/realEstate/private/constructor/constructor.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import ConstructorSheetView from "@propertyManagementModule/clients/panel/private/constructors/center/sheetView/constructorSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {EntityCardShell} from "@propertyManagementModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@propertyManagementModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@propertyManagementModule/components/custom/cards/entityCard.constants.ts";

function constructorEditPath(c: Constructor) {
    const params = new URLSearchParams();
    params.set("constructorId", c._id);
    if (c.name) params.set("constructorName", c.name);
    return `/tenancy/systemSettings/constructors/edit?${params.toString()}`;
}

function phoneParts(constructor: Constructor) {
    const raw = constructor.phoneNumber as string | {prefix?: string; number?: string} | undefined;
    if (!raw) return {href: "", display: ""};
    if (typeof raw === "string") return {href: raw, display: raw};
    return {
        href: `${raw.prefix || ""}${raw.number || ""}`,
        display: `${raw.prefix || ""} ${raw.number || ""}`.trim(),
    };
}

type ConstructorCardProps = WithLanguageType & {
    constructor: Constructor;
    hideActions?: boolean;
    onDelete?: (deletedConstructor?: Constructor, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
};

function ConstructorCard({
    constructor: constructorProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    sheetOnly = false,
}: ConstructorCardProps) {
    const {action, setAction, entity: constructor, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: constructorProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {href: phoneHref, display: phoneDisplay} = phoneParts(constructor);

    const {read, restore} = useAccess("constructors");
    const edificesCount = constructor.edifices?.length ?? 0;
    const hasEdifices = edificesCount > 0;

    if (hideAfterDeletion || !restore) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    return (
        <>
            {!sheetOnly && (
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={constructor.deletedAt} deletedBy={constructor.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                iconTile={
                                    <TooltipDisplayer tooltip={resolveLanguageKey("logo")}>
                                        <Avatar className="h-12 w-12 shrink-0 rounded-xl border-0">
                                            {constructor.logo && (
                                                <AvatarImage
                                                    src={`/api/auxiliary/media/${constructor.logo._id || constructor.logo}`}
                                                    alt={constructor.name}
                                                    className="shadow-sm"
                                                />
                                            )}
                                            <AvatarFallback className="rounded-xl bg-muted/50 text-muted-foreground">
                                                <IconBuilding className="h-5 w-5 shadow-sm" />
                                            </AvatarFallback>
                                        </Avatar>
                                    </TooltipDisplayer>
                                }
                                title={constructor.name}
                                showTitle={!!read?.name}
                                badges={
                                    hasEdifices ? (
                                        <Badge variant="outline" className="text-xs">
                                            {resolveLanguageKey("edifices")}: {edificesCount}
                                        </Badge>
                                    ) : undefined
                                }
                                hideActions={hideActions}
                                actionMenu={
                                    <ActionMenu
                                        accessModel="constructors"
                                        deletedData={constructor}
                                        onAction={(a: string) => setAction(a)}
                                        editPath={constructorEditPath(constructor)}
                                    />
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                {!!constructor.addresses?.[0]?.city?.name && (
                                    <InfoRow
                                        icon={IconMapPin}
                                        label={resolveLanguageKey("address")}
                                        tooltip={resolveLanguageKey("address")}
                                        show={true}
                                        value={<span className="text-xs text-muted-foreground">{constructor.addresses[0].city.name}</span>}
                                    />
                                )}
                                <InfoRow
                                    icon={IconPhone}
                                    label={resolveLanguageKey("phoneNumber")}
                                    tooltip={resolveLanguageKey("phoneNumber")}
                                    show={!!read?.phoneNumber}
                                    value={
                                        phoneHref ? (
                                            <Badge variant="outline" asChild className="text-xs font-medium">
                                                <a href={`tel:${phoneHref}`} onClick={(e) => e.stopPropagation()}>
                                                    {phoneDisplay}
                                                </a>
                                            </Badge>
                                        ) : null
                                    }
                                />
                                <InfoRow
                                    icon={IconMail}
                                    label={resolveLanguageKey("email")}
                                    tooltip={resolveLanguageKey("email")}
                                    show={!!read?.email}
                                    value={
                                        constructor.email ? (
                                            <Badge variant="outline" asChild className="text-xs font-medium truncate max-w-[200px]">
                                                <a href={`mailto:${constructor.email}`} onClick={(e) => e.stopPropagation()}>
                                                    {constructor.email}
                                                </a>
                                            </Badge>
                                        ) : null
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </EntityCardShell>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <ConstructorSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            constructor={constructor}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="constructors"
                            deleteId={constructor._id}
                            openAlert={action === "delete"}
                            name={read?.name && constructor.name}
                            confirmName={read?.name && constructor.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/constructor"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="constructors"
                            deleteId={constructor._id}
                            openAlert={action === "restore"}
                            name={read?.name && constructor.name}
                            confirmName={read?.name && constructor.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/realEstate/constructor/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/constructors/center/cardView/constructorCard.tsx"),
    withDebug(true, true)
)(ConstructorCard);
