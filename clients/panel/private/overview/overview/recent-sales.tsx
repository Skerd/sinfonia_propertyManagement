import React from 'react';
import type { RecentSaleItem } from 'armonia/src/modules/propertyManagement/api/realEstate/private/dashboard/dashboard.form.response.type.ts';
import {Avatar, AvatarFallback} from "@coreModule/components/ui/avatar.tsx";

export type RecentSalesProps = {
  recentSales: RecentSaleItem[];
  /** Optional label for empty state (i18n). */
  noSalesLabel?: string;
  /** Optional prefix for unit label, e.g. "Unit" (i18n). */
  unitLabelPrefix?: string;
};

export const RecentSales: React.FC<RecentSalesProps> = ({
  recentSales,
  noSalesLabel,
  unitLabelPrefix,
}) => {
  if (!recentSales.length) {
    return (
      <div className="py-2 text-center text-muted-foreground text-[11px]">
        {noSalesLabel}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {recentSales.map((item) => {
        const name =
          item.soldBy?.fullName ??
          [item.soldBy?.name, item.soldBy?.surname].filter(Boolean).join(" ") ??
          "—";
        const initials = name
          .split(/\s+/)
          .map((s) => s[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        const unitLabel = item.unit?.unitNumber || item.unit?.name || item.unit?._id || "—";
        return (
          <div className="flex items-center gap-2 py-0.5" key={item._id}>
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarFallback className="text-[10px]">{initials || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
              <div className="min-w-0 shrink">
                <span className="truncate text-[11px] font-medium text-foreground">{name}</span>
                <span className="text-muted-foreground text-[11px]">
                  {" · "}
                  {unitLabelPrefix} {unitLabel}
                </span>
              </div>
              <span className="shrink-0 text-[11px] font-semibold tabular-nums text-foreground">
                +${(item.finalPrice ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
