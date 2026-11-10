import {useMemo} from "react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@coreModule/components/ui/select.tsx";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import {ApiSelect} from "@coreModule/components/viewEngine/widgets/inputs/apiSelect/apiSelect.tsx";
import {
    PAYMENTS_HUB_KIND_VALUES,
    PAYMENTS_HUB_STATUS_VALUES,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/paymentsHub/paymentsHub.constants.ts";
import {selectBodyWithFilters} from "@propertyManagementModule/clients/panel/private/rentalsHub/rentalsHubHelpers.ts";
import {
    RentalsHubFilterField as FilterField,
    RentalsHubFilterToolbar as FilterToolbar,
} from "@propertyManagementModule/clients/panel/private/rentalsHub/RentalsHubFilterField.tsx";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import {addCalendarDays, calendarMonthOf, companyToday} from "@coreModule/helpers/general/dateTime.ts";
import {hasActiveScope, type PaymentsHubScope} from "./paymentsHubHelpers.ts";

/**
 * The presets behind the quick buttons: what is late, and what lands soon. Due days are the company's local days
 * (D115), so "today" is the company's today (TD-B157), the day the server and its crons count from.
 */
function presetRange(preset: "overdue" | "next7" | "next30" | "thisMonth", today: string): Partial<PaymentsHubScope> {
    if (preset === "overdue") {
        return {status: "overdue", dateField: "dueDate", dateFrom: "", dateTo: ""};
    }
    if (preset === "thisMonth") {
        const {from, to} = calendarMonthOf(today);
        return {status: "", dateField: "dueDate", dateFrom: from, dateTo: to};
    }
    // The next 7 / 30 days including today, the window the hub's tiles count.
    const days = preset === "next7" ? 6 : 29;
    return {status: "", dateField: "dueDate", dateFrom: today, dateTo: addCalendarDays(today, days)};
}

type PaymentsHubFiltersProps = {
    resolveLanguageKey: ResolveLanguageKey;
    scope: PaymentsHubScope;
    searchInput: string;
    onSearchInputChange: (value: string) => void;
    onScopeChange: (patch: Partial<PaymentsHubScope>) => void;
    onReset: () => void;
};

export default function PaymentsHubFilters({
    resolveLanguageKey,
    scope,
    searchInput,
    onSearchInputChange,
    onScopeChange,
    onReset,
}: PaymentsHubFiltersProps) {
    const rk = (key: string) => String(resolveLanguageKey(`filters.${key}`));
    const timeZone = useCompanyTimeZone();

    const edificeSelectBody = useMemo(
        () => selectBodyWithFilters([{field: "project", value: scope.project}]),
        [scope.project],
    );
    const floorSelectBody = useMemo(
        () => selectBodyWithFilters([
            {field: "edifice", value: scope.edifice},
            {field: "project", value: scope.project},
        ]),
        [scope.edifice, scope.project],
    );
    const unitSelectBody = useMemo(
        () => selectBodyWithFilters([
            {field: "floor", value: scope.floor},
            {field: "edifice", value: scope.edifice},
            {field: "project", value: scope.project},
        ]),
        [scope.floor, scope.edifice, scope.project],
    );

    return (
        <FilterToolbar className="rounded-lg border">
            <div className="flex flex-col gap-y-3">
                <div className="flex items-end gap-3">
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">{rk("searchLabel")}</Label>
                        <Input
                            value={searchInput}
                            onChange={(e) => onSearchInputChange(e.target.value)}
                            placeholder={rk("searchPlaceholder")}
                        />
                    </div>
                    {hasActiveScope(scope) || searchInput.trim() ? (
                        <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={onReset}>
                            {rk("clearFilters")}
                        </Button>
                    ) : null}
                </div>

                <div className="flex flex-wrap items-end gap-3">
                    <FilterField label={rk("projectLabel")}>
                        <ApiSelect
                            apiUrl="/api/realEstate/project/select"
                            placeholder={rk("projectPlaceholder")}
                            value={scope.project}
                            onValueChange={(v: string | string[]) =>
                                onScopeChange({
                                    project: typeof v === "string" ? v : "",
                                    edifice: "",
                                    floor: "",
                                    unit: "",
                                })}
                            className="h-9 w-full"
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    </FilterField>
                    <FilterField label={rk("edificeLabel")}>
                        <ApiSelect
                            key={`edifice-${scope.project || "none"}`}
                            apiUrl="/api/realEstate/edifice/select"
                            postBody={edificeSelectBody}
                            placeholder={rk("edificePlaceholder")}
                            value={scope.edifice}
                            onValueChange={(v: string | string[]) =>
                                onScopeChange({edifice: typeof v === "string" ? v : "", floor: "", unit: ""})}
                            disabled={!scope.project}
                            className="h-9 w-full"
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    </FilterField>
                    <FilterField label={rk("floorLabel")}>
                        <ApiSelect
                            key={`floor-${scope.edifice || scope.project || "none"}`}
                            apiUrl="/api/realEstate/floor/select"
                            postBody={floorSelectBody}
                            placeholder={rk("floorPlaceholder")}
                            value={scope.floor}
                            onValueChange={(v: string | string[]) =>
                                onScopeChange({floor: typeof v === "string" ? v : "", unit: ""})}
                            disabled={!scope.edifice && !scope.project}
                            className="h-9 w-full"
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    </FilterField>
                    <FilterField label={rk("unitLabel")}>
                        <ApiSelect
                            key={`unit-${scope.floor || scope.edifice || scope.project || "none"}`}
                            apiUrl="/api/realEstate/unit/select"
                            postBody={unitSelectBody}
                            placeholder={rk("unitPlaceholder")}
                            value={scope.unit}
                            onValueChange={(v: string | string[]) =>
                                onScopeChange({unit: typeof v === "string" ? v : ""})}
                            disabled={!scope.project && !scope.edifice && !scope.floor}
                            className="h-9 w-full"
                            resolveLanguageKey={resolveLanguageKey}
                        />
                    </FilterField>
                    <FilterField label={rk("statusLabel")}>
                        <Select
                            value={scope.status || "__all__"}
                            onValueChange={(v) => onScopeChange({status: v === "__all__" ? "" : v})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={rk("statusPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">{rk("statusPlaceholder")}</SelectItem>
                                {PAYMENTS_HUB_STATUS_VALUES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {String(resolveLanguageKey(`status.${s}`))}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterField>
                    <FilterField label={rk("kindLabel")}>
                        <Select
                            value={scope.kind || "__all__"}
                            onValueChange={(v) => onScopeChange({kind: v === "__all__" ? "" : v})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={rk("kindPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">{rk("kindPlaceholder")}</SelectItem>
                                {PAYMENTS_HUB_KIND_VALUES.map((k) => (
                                    <SelectItem key={k} value={k}>
                                        {String(resolveLanguageKey(`kind.${k}`))}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterField>
                    <FilterField label={rk("dateFieldLabel")}>
                        <Select
                            value={scope.dateField}
                            onValueChange={(v) => onScopeChange({dateField: v as PaymentsHubScope["dateField"]})}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dueDate">{rk("dateFieldDue")}</SelectItem>
                                <SelectItem value="paidDate">{rk("dateFieldPaid")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterField>
                    <FilterField label={rk("dateRangeLabel")} className="min-w-[15rem] flex-[1.4]">
                        <div className="flex gap-2">
                            <DateInput
                                valueFormat="YYYY-MM-DD"
                                value={scope.dateFrom}
                                onChange={(v) => onScopeChange({dateFrom: v})}
                                className="h-9"
                                placeholder={rk("dateFromLabel")}
                            />
                            <DateInput
                                valueFormat="YYYY-MM-DD"
                                value={scope.dateTo}
                                onChange={(v) => onScopeChange({dateTo: v})}
                                className="h-9"
                                placeholder={rk("dateToLabel")}
                            />
                        </div>
                    </FilterField>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">{rk("presetsLabel")}</span>
                    {(["overdue", "next7", "next30", "thisMonth"] as const).map((preset) => (
                        <Button
                            key={preset}
                            type="button"
                            variant="outline"
                            size="sm"
                            // Presets only touch the date/status side; the project → unit scope stays.
                            onClick={() => onScopeChange(presetRange(preset, companyToday(timeZone)))}
                        >
                            {rk(`presets.${preset}`)}
                        </Button>
                    ))}
                </div>
            </div>
        </FilterToolbar>
    );
}
