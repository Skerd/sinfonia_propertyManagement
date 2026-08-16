import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Avatar, AvatarFallback} from "@coreModule/components/ui/avatar.tsx";
import {IconCurrencyDollar, IconHome, IconUser} from "@tabler/icons-react";
import CommissionRowMenuExtras from "@propertyManagementModule/clients/panel/private/commissions/center/actions/commissionRowMenuExtras.tsx";
import CommissionSheetView, {commissionConfirmLabel} from "@propertyManagementModule/clients/panel/private/commissions/center/sheetView/commissionSheetView.tsx";
import {Commission} from "armonia/src/modules/propertyManagement/api/realEstate/private/commission/commission.dto.ts";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

export type CommissionCardProps = WithLanguageType & {
    commission: Commission;
    fetchId?: string;
    hideActions?: boolean;
    sheetOnly?: boolean;
    onModifySuccess?: (updated?: Commission) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<Commission> | null>;
};

function CommissionCard({
    commission,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    sheetOnly = false,
    onModifySuccess,
    innerRef,
}: CommissionCardProps) {
    return (
        <EntityCard
            resource="commissions"
            entity={commission}
            fetchId={fetchId}
            singleUrl="/api/realEstate/commission/single"
            hideActions={hideActions}
            hideEdit
            hideDelete
            hideRestore
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={CommissionSheetView}
            sheetEntityProp="commission"
            deleteUrl=""
            restoreUrl=""
            failedTitle={String(resolveLanguageKey("failedTitle") || "")}
            failedDescription={String(resolveLanguageKey("failedDescription") || "")}
            titlePath="agent.name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onModifySuccess: (updated?: Commission) => {
                    if (updated) setEntity({...entity, ...updated});
                    onModifySuccess?.(updated);
                },
            })}
        >
            {({entity, setEntity}) => (
                <>
                    <EntityCard.Header
                        titlePath="agent.name"
                        title={commissionConfirmLabel(entity) ?? "—"}
                        icon={
                            <Avatar className="h-10 w-10 shrink-0 rounded-xl border-0">
                                <AvatarFallback className="rounded-xl bg-muted/50 text-muted-foreground text-sm font-semibold">
                                    {entity.agent
                                        ? `${entity.agent.name?.[0] ?? ""}${entity.agent.surname?.[0] ?? ""}`.toUpperCase() || "?"
                                        : <IconUser className="h-4 w-4" />}
                                </AvatarFallback>
                            </Avatar>
                        }
                    >
                        <CommissionRowMenuExtras
                            commission={entity}
                            onModify={(updated?: Commission) => {
                                if (updated) setEntity({...entity, ...updated});
                                onModifySuccess?.(updated);
                            }}
                        />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconUser}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            type="enum"
                            languageKeyCategory="fields.!enums.status"
                            value={entity.status}
                        />
                        <DisplayRow
                            icon={IconCurrencyDollar}
                            label={resolveLanguageKey("amount")}
                            tooltip={resolveLanguageKey("amount")}
                            path="amount"
                            type="currency"
                            value={{amount: entity.amount, currency: entity.currency}}
                        />
                        <DisplayRow
                            icon={IconHome}
                            label={entity.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                            tooltip={entity.unit?.unitType?.name ?? resolveLanguageKey("unit")}
                            path="unit"
                            value={entity.unit?.name ?? entity.unit?.unitNumber}
                        />
                        <DisplayRow
                            icon={IconCurrencyDollar}
                            label={resolveLanguageKey(
                                entity.sourceType === "reservation"
                                    ? "fields.!enums.sourceType.reservation"
                                    : "fields.!enums.sourceType.sale",
                            )}
                            tooltip={resolveLanguageKey(
                                entity.sourceType === "reservation"
                                    ? "fields.!enums.sourceType.reservation"
                                    : "fields.!enums.sourceType.sale",
                            )}
                            path={entity.sourceType === "reservation" ? "reservation" : "sale"}
                            value={entity.sale?.name ?? entity.reservation?.name}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/commissions/center/cardView/commissionCard.tsx"),
    withDebug(true, true),
)(CommissionCard);
