import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarClock, IconListNumbers, IconWallet} from "@tabler/icons-react";
import CopyTooltip from "@coreModule/components/custom/copyTooltip.tsx";
import type {PaymentPlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/paymentPlan.dto.ts";
import PaymentPlanSheetView from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/paymentPlanSheetView.tsx";
import SalePayDownPaymentAction from "@propertyManagementModule/clients/panel/private/sales/center/actions/salePayDownPaymentAction.tsx";
import SalePayDownPaymentDialog from "@propertyManagementModule/components/custom/sale/salePayDownPaymentDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

type PaymentPlanCardProps = WithLanguageType & {
    paymentPlan: PaymentPlan;
    fetchId?: string;
    hideActions?: boolean;
    sheetOnly?: boolean;
    small?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<PaymentPlan> | null>;
};

function PaymentPlanCard({
    paymentPlan,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    sheetOnly = false,
    small,
    innerRef,
}: PaymentPlanCardProps) {
    return (
        <EntityCard
            resource="paymentPlans"
            entity={paymentPlan}
            fetchId={fetchId}
            singleUrl="/api/realEstate/unit/sale/paymentPlan/single"
            hideActions={hideActions}
            hideEdit
            hideDelete
            hideRestore
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={PaymentPlanSheetView}
            sheetEntityProp="paymentPlan"
            deleteUrl=""
            restoreUrl=""
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "payDownPayment" && (
                        <SalePayDownPaymentDialog
                            open
                            onOpenChange={(open: boolean) => {
                                if (!open) setAction("");
                            }}
                            paymentPlanId={entity._id}
                            onSuccess={(updated: PaymentPlan) => {
                                setEntity({...entity, ...updated});
                                setAction("");
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath="name"
                        title={
                            <span className="flex items-center gap-1 truncate">
                                {entity.name?.trim() || "—"}
                                <CopyTooltip text={entity.name ?? entity._id} />
                            </span>
                        }
                    >
                        {!entity.downPaymentPaid ? (
                            <SalePayDownPaymentAction
                                isPaid={!!entity.downPaymentPaid}
                                onAction={(actionName: string) => setAction(actionName)}
                            />
                        ) : null}
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconWallet}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            type="enum"
                            languageKeyCategory="paymentPlanStatusState"
                            value={entity.status}
                        />
                        <DisplayRow
                            icon={IconWallet}
                            label={resolveLanguageKey("remainingBalance")}
                            tooltip={resolveLanguageKey("remainingBalance")}
                            path="remainingBalance"
                            type="currency"
                            value={{amount: entity.remainingBalance, currency: entity.currency}}
                        />
                        <DisplayRow
                            icon={IconListNumbers}
                            label={resolveLanguageKey("numberOfInstallments")}
                            tooltip={resolveLanguageKey("numberOfInstallments")}
                            path="numberOfInstallments"
                            type="number"
                            value={entity.numberOfInstallments}
                        />
                        {!small && (
                            <DisplayRow
                                icon={IconCalendarClock}
                                label={resolveLanguageKey("endDate")}
                                tooltip={resolveLanguageKey("endDate")}
                                path="endDate"
                                type="date"
                                value={entity.endDate}
                            />
                        )}
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/clients/panel/private/sales/center/cardView/paymentPlanCard.tsx"),
    withDebug(true, true),
)(PaymentPlanCard);
