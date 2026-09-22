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
import {hasActiveScope, type PaymentsHubScope} from "./paymentsHubHelpers.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

function ymd(date: Date): string {
    return date.toISOString().slice(0, 10);
}

/** The presets behind the quick buttons: what is late, and what lands soon. */
function presetRange(preset: "overdue" | "next7" | "next30" | "thisMonth"): Partial<PaymentsHubScope> {
    const today = new Date();
    const todayYmd = ymd(today);
    if (preset === "overdue") {
        return {status: "overdue", dateField: "dueDate", dateFrom: "", dateTo: ""};
    }
    if (preset === "thisMonth") {
        const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
        const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
        return {status: "", dateField: "dueDate", dateFrom: ymd(start), dateTo: ymd(end)};
    }
    const days = preset === "next7" ? 7 : 30;
    return {
        status: "",
        dateField: "dueDate",
        dateFrom: todayYmd,
        dateTo: ymd(new Date(today.getTime() + days * DAY_MS)),
    };
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
                                valueFormat="yyyy-MM-dd"
                                value={scope.dateFrom}
                                onChange={(v) => onScopeChange({dateFrom: v})}
                                className="h-9"
                                placeholder={rk("dateFromLabel")}
                            />
                            <DateInput
                                valueFormat="yyyy-MM-dd"
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
                            onClick={() => onScopeChange(presetRange(preset))}
                        >
                            {rk(`presets.${preset}`)}
                        </Button>
                    ))}
                </div>
            </div>
        </FilterToolbar>
    );
}
