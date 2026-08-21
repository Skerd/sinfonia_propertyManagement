import { compose } from 'redux';
import {
  IconAlertTriangle,
  IconBell,
  IconClock,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { PaymentAlertItem } from 'armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts';
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import { DashboardWidgetCard, DashboardWidgetEmpty } from '@propertyManagementModule/components/custom/cards/DashboardWidgetCard.tsx';
import type { KpiDrillDownContext } from '@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts';
import {
  kpiPaymentAlertPlans,
  kpiPaymentAlertReservations,
} from '@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts';

export interface PaymentAlertsProps extends WithLanguageType {
  overdueCount: number;
  alerts?: PaymentAlertItem[];
  title?: string;
  viewAllLabel?: string;
  /** Optional scope (edifice) for filtered footer drill-downs. */
  drillDownContext?: KpiDrillDownContext;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

function getAlertStyle(days: number) {
  if (days < 0)
    return { bg: 'bg-destructive/10', border: 'border-destructive/30', icon: IconAlertTriangle, iconColor: 'text-destructive' };
  if (days <= 7)
    return { bg: 'bg-status-reserved/10', border: 'border-status-reserved/30', icon: IconClock, iconColor: 'text-status-reserved' };
  return { bg: 'bg-primary/10', border: 'border-primary/30', icon: IconBell, iconColor: 'text-primary' };
}

function alertKind(alert: PaymentAlertItem): "installment" | "reservation" {
  return alert.kind === "reservation" ? "reservation" : "installment";
}

function PaymentAlertsInner({
  overdueCount,
  alerts,
  title,
  viewAllLabel,
  drillDownContext = {},
  resolveLanguageKey,
  languageCode = 'en-US',
}: PaymentAlertsProps) {
  const navigate = useNavigate();
  const hasList = alerts && alerts.length > 0;
  const hasEmptyList = alerts && alerts.length === 0;
  const overdueInList = alerts ? alerts.filter((a) => a.daysUntilDue < 0).length : overdueCount;

  const effectiveTitle = title ?? resolveLanguageKey('title');
  const effectiveViewAllLabel = viewAllLabel ?? resolveLanguageKey('viewAllLabel');
  const locale = languageCode === 'sq-AL' ? 'sq-AL' : 'en-US';
  const paymentPlansHref = kpiPaymentAlertPlans(drillDownContext);
  const reservationsHref = kpiPaymentAlertReservations(drillDownContext);

  return (
    <DashboardWidgetCard
      title={effectiveTitle}
      glass
      contentClassName="pt-0"
      footer={
        <div className="flex w-full flex-col gap-0.5">
          <Button
            variant="link"
            className="w-full py-1.5 h-auto text-primary text-xs"
            onClick={() => navigate(paymentPlansHref)}
          >
            {effectiveViewAllLabel}
          </Button>
          <Button
            variant="link"
            className="w-full py-1.5 h-auto text-primary text-xs"
            onClick={() => navigate(reservationsHref)}
          >
            {resolveLanguageKey('viewReservationsLabel')}
          </Button>
        </div>
      }
    >
      <div className="flex items-center justify-end mb-3 -mt-1">
        {(overdueInList > 0 || overdueCount > 0) && (
          <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive text-xs">
            {hasList ? overdueInList : overdueCount} {resolveLanguageKey('overdueBadge')}
          </Badge>
        )}
      </div>

      {hasList ? (
        <>
          <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-0.5">
            {alerts!.slice(0, 10).map((alert, index) => {
              const style = getAlertStyle(alert.daysUntilDue);
              const IconComponent = style.icon;
              const unitLabel = alert.unit.unitNumber ?? alert.unit.name ?? alert.unit._id;
              const kind = alertKind(alert);
              return (
                <div
                  key={`${kind}-${alert.reservationId ?? alert.unit._id}-${index}`}
                  className={cn(
                    'px-2.5 py-2 rounded-md border transition-colors hover:border-opacity-80',
                    style.bg,
                    style.border
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn('p-1 rounded shrink-0', style.iconColor)}>
                      <IconComponent size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1.5">
                        <span className="font-mono text-sm font-medium text-foreground truncate">
                          {unitLabel}
                        </span>
                        <span className="text-sm font-semibold text-foreground shrink-0 tabular-nums">
                          {formatCurrency(alert.installment.amount)}
                        </span>
                      </div>
                      {kind === "reservation" && (
                        <p className="text-2xs text-muted-foreground mt-0.5">
                          {resolveLanguageKey('reservationLabel')}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1 gap-1.5">
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.installment.dueDate).toLocaleDateString(locale)}
                        </span>
                        <span
                          className={cn(
                            'text-xs font-medium shrink-0',
                            alert.daysUntilDue < 0
                              ? 'text-destructive'
                              : alert.daysUntilDue <= 7
                                ? 'text-status-reserved'
                                : 'text-primary'
                          )}
                        >
                          {alert.daysUntilDue < 0
                            ? `${Math.abs(alert.daysUntilDue)} ${resolveLanguageKey('daysLate')}`
                            : alert.daysUntilDue === 0
                              ? resolveLanguageKey('today')
                              : `${alert.daysUntilDue} ${resolveLanguageKey('daysRemaining')}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {alerts!.length > 10 && (
            <button
              type="button"
              className="w-full mt-3 py-1.5 text-primary text-xs font-medium hover:underline"
              onClick={() =>
                navigate(
                  alerts!.some((a) => alertKind(a) === 'reservation') &&
                    !alerts!.some((a) => alertKind(a) === 'installment')
                    ? reservationsHref
                    : paymentPlansHref
                )
              }
            >
              {resolveLanguageKey('viewAllCount')} ({alerts!.length})
            </button>
          )}
        </>
      ) : hasEmptyList || overdueCount === 0 ? (
        <DashboardWidgetEmpty message={resolveLanguageKey(hasEmptyList ? 'noUpcomingPayments' : 'noOverduePayments')} />
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-md border border-destructive/30 bg-destructive/10">
            <div className="p-1 rounded shrink-0 text-destructive">
              <IconAlertTriangle size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {overdueCount} {overdueCount === 1 ? resolveLanguageKey('overdueInstallment') : resolveLanguageKey('overdueInstallments')}
              </p>
              <p className="text-xs text-muted-foreground">
                {resolveLanguageKey('viewPlansForDetails')}
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardWidgetCard>
  );
}

export const PaymentAlerts = compose(
  withLanguage("src/modules/propertyManagement/components/custom/dashboard/paymentAlerts.tsx")
)(PaymentAlertsInner);
