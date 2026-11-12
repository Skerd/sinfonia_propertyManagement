import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCalendarClock, IconListNumbers, IconWallet} from "@tabler/icons-react";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import type {PaymentPlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/paymentPlan.dto.ts";
import PaymentPlanSheetView from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/paymentPlanSheetView.tsx";
import {saleBuyerName} from "@propertyManagementModule/clients/panel/private/sales/center/sheetView/saleSheetView.tsx";
import SalePayDownPaymentAction from "@propertyManagementModule/clients/panel/private/sales/center/actions/salePayDownPaymentAction.tsx";
import SalePayDownPaymentDialog from "@propertyManagementModule/components/custom/sale/salePayDownPaymentDialog.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
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
                    {/* Named by the buyer of its sale, the code beside it, the state as a badge (UX-01, UX-02, D151). */}
                    <EntityCard.Header
                        titlePath={["sale", "name"]}
                        title={saleBuyerName(entity.sale) || entity.name || "—"}
                        subtitlePath="name"
                        subtitle={saleBuyerName(entity.sale) ? entity.name : undefined}
                        badgesBesideTitle
                        badges={
                            <StatusBadge
                                tableConfigKey="paymentplans"
                                field="status"
                                value={entity.status}
                                label={String(resolveLanguageKey(`paymentPlanStatusState.${entity.status}`))}
                            />
                        }
                    >
                        {/* The server takes payments only on an active or defaulted plan. */}
                        {!entity.downPaymentPaid && (entity.status === "active" || entity.status === "defaulted") ? (
                            <SalePayDownPaymentAction
                                isPaid={!!entity.downPaymentPaid}
                                onAction={(actionName: string) => setAction(actionName)}
                            />
                        ) : null}
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconWallet}
                            label={resolveLanguageKey("remainingBalance")}
                            tooltip={resolveLanguageKey("remainingBalance")}
                            path="remainingBalance"
                            type="currency"
                            value={{amount: entity.remainingBalance, currency: entity.saleCurrency}}
                        />
                        <EntityCardRow
                            icon={IconListNumbers}
                            label={resolveLanguageKey("numberOfInstallments")}
                            tooltip={resolveLanguageKey("numberOfInstallments")}
                            path="numberOfInstallments"
                            type="number"
                            value={entity.numberOfInstallments}
                        />
                        {!small && (
                            <EntityCardRow
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
    withDebug(true, true, "paymentPlans"),
)(PaymentPlanCard);
