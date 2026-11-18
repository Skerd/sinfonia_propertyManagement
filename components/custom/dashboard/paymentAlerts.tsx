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
  kpiPaymentAlertInstallmentItem,
  kpiPaymentAlertPlans,
  kpiPaymentAlertRentItem,
  kpiPaymentAlertReservationItem,
  kpiPaymentAlertReservations,
} from '@propertyManagementModule/helpers/dashboard/kpiDrillDown.ts';
import {formatRevenueByCurrencyLines} from "@propertyManagementModule/helpers/rentals/formatRevenueByCurrency.ts";
import {getName} from "@coreModule/helpers/general/names.ts";
import {companyToday, DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";

export interface PaymentAlertsProps extends WithLanguageType {
  overdueCount: number;
  alerts?: PaymentAlertItem[];
  title?: string;
  viewAllLabel?: string;
  /** Optional scope (edifice) for filtered footer drill-downs. */
  drillDownContext?: KpiDrillDownContext;
}

function getAlertStyle(days: number) {
  if (days < 0)
    return { bg: 'bg-destructive/10', border: 'border-destructive/30', icon: IconAlertTriangle, iconColor: 'text-destructive' };
  if (days <= 7)
    return { bg: 'bg-status-reserved/10', border: 'border-status-reserved/30', icon: IconClock, iconColor: 'text-status-reserved' };
  return { bg: 'bg-primary/10', border: 'border-primary/30', icon: IconBell, iconColor: 'text-primary' };
}

function alertKind(alert: PaymentAlertItem): "installment" | "reservation" | "rent" {
  if (alert.kind === "reservation") return "reservation";
  if (alert.kind === "rent") return "rent";
  return "installment";
}

function alertHref(alert: PaymentAlertItem, ctx: KpiDrillDownContext, today: string): string {
  const kind = alertKind(alert);
  if (kind === "reservation") return kpiPaymentAlertReservationItem(ctx, alert, today);
  if (kind === "rent") return kpiPaymentAlertRentItem(ctx, alert);
  return kpiPaymentAlertInstallmentItem(ctx, alert);
}

function PaymentAlertsInner({
  overdueCount,
  alerts,
  title,
  viewAllLabel,
  drillDownContext = {},
  resolveLanguageKey,
}: PaymentAlertsProps) {
  const navigate = useNavigate();
  const today = companyToday(useCompanyTimeZone());
  const hasList = alerts && alerts.length > 0;
  const hasEmptyList = alerts && alerts.length === 0;
  const overdueInList = alerts ? alerts.filter((a) => a.daysUntilDue < 0).length : overdueCount;

  const effectiveTitle = title ?? resolveLanguageKey('title');
  const effectiveViewAllLabel = viewAllLabel ?? resolveLanguageKey('viewAllLabel');
  const paymentPlansHref = kpiPaymentAlertPlans(drillDownContext);
  const reservationsHref = kpiPaymentAlertReservations(drillDownContext, today);

  return (
    <DashboardWidgetCard
      title={effectiveTitle}
      action={
        overdueInList > 0 || overdueCount > 0 ? (
          <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive text-xs">
            {hasList ? overdueInList : overdueCount} {resolveLanguageKey('overdueBadge')}
          </Badge>
        ) : undefined
      }
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
          <Button
            variant="link"
            className="w-full py-1.5 h-auto text-primary text-xs"
            onClick={() => navigate('/realEstate/rentalsHub?tab=payments')}
          >
            {resolveLanguageKey('viewRentalsLabel')}
          </Button>
        </div>
      }
    >
      {hasList ? (
        <>
          <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-0.5">
            {alerts!.slice(0, 10).map((alert, index) => {
              const style = getAlertStyle(alert.daysUntilDue);
              const IconComponent = style.icon;
              const unitLabel = alert.unit.unitNumber ?? alert.unit.name ?? alert.unit._id;
              const kind = alertKind(alert);
              const clientLabel = getName(alert.client);
              const href = alertHref(alert, drillDownContext, today);
              return (
                <Button
                    type="button"
                    variant="bare"
                    key={`${kind}-${alert.reservationId ?? alert.rentalPaymentId ?? alert.saleId ?? alert.unit._id}-${index}`}
                    className={cn('w-full text-left px-2.5 py-2 rounded-md border transition-colors hover:border-opacity-80 cursor-pointer',
                    style.bg,
                    style.border
                  )}
                    onClick={() => navigate(href)}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn('p-1 rounded shrink-0', style.iconColor)}>
                      <IconComponent size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1.5">
                        <span className="text-sm font-medium text-foreground truncate">
                          {unitLabel}
                        </span>
                        <span className="text-sm font-semibold text-foreground shrink-0 tabular-nums">
                          {formatRevenueByCurrencyLines([{
                            currencyId: alert.currency?._id ?? "",
                            currencyName: alert.currency?.name,
                            currencySymbol: alert.currency?.symbol,
                            currencyDecimalPlaces: alert.currency?.decimalPlaces,
                            value: alert.installment.amount,
                          }])}
                        </span>
                      </div>
                      {clientLabel ? (
                        <p className="text-xs font-medium text-foreground truncate mt-0.5">
                          {clientLabel}
                        </p>
                      ) : null}
                      {kind === "reservation" && (
                        <p className="text-2xs text-muted-foreground mt-0.5">
                          {resolveLanguageKey('reservationLabel')}
                        </p>
                      )}
                      {kind === "rent" && (
                        <p className="text-2xs text-muted-foreground mt-0.5">
                          {resolveLanguageKey('rentLabel')}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1 gap-1.5">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(alert.installment.dueDate, {timeZone: "UTC", format: DATE_FORMATS.mediumDate})}
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
                </Button>
              );
            })}
          </div>
          {alerts!.length > 10 && (
            <Button
                type="button"
                variant="bare"
                className="w-full mt-3 py-1.5 text-primary text-xs font-medium hover:underline"
                onClick={() =>
                navigate(
                  alerts!.every((a) => alertKind(a) === 'rent')
                    ? '/realEstate/rentalsHub?tab=payments'
                    : alerts!.some((a) => alertKind(a) === 'reservation') &&
                        !alerts!.some((a) => alertKind(a) === 'installment')
                    ? reservationsHref
                    : paymentPlansHref
                )
              }
            >
              {resolveLanguageKey('viewAllCount')} ({alerts!.length})
            </Button>
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
