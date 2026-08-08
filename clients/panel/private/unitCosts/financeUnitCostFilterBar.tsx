import type { ResolveLanguageKey } from "@coreModule/helpers/hocs/withLanguage.tsx";
import { ApiSelect } from "@coreModule/components/custom/apiSelect";
import { SimpleSelect } from "@coreModule/components/custom/simpleSelect";
import { Button } from "@coreModule/components/ui/button.tsx";
import { Card, CardContent } from "@coreModule/components/ui/card.tsx";
import { Input } from "@coreModule/components/ui/input.tsx";
import { Label } from "@coreModule/components/ui/label.tsx";
import {
    UNIT_COST_PAYMENT_STATUS_VALUES,
    UNIT_COST_VERIFICATION_STATUS_VALUES,
} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.constants.ts";

export type FinanceToolbarValues = {
    project: string;
    edifice: string;
    floor: string;
    unit: string;
    verificationStatus: string;
    paymentStatus: string;
    vendorContains: string;
    purchasePersonId: string;
};

export function emptyFinanceToolbarValues(): FinanceToolbarValues {
    return {
        project: "",
        edifice: "",
        floor: "",
        unit: "",
        verificationStatus: "",
        paymentStatus: "",
        vendorContains: "",
        purchasePersonId: "",
    };
}

export type FinanceUnitCostFilterBarProps = {
    value: FinanceToolbarValues;
    onChange: (next: FinanceToolbarValues) => void;
    onApply: () => void;
    onClear: () => void;
    resolveLanguageKey: ResolveLanguageKey;
    /** When set (embedded unitCosts), hide hierarchy selectors — scope is fixed to that unit. */
    lockedUnitId?: string;
};

function depFilters(field: string, parents: Array<{field: string; value: string}>) {
    if (parents.length === 0) return undefined;
    return {
        filters: {
            id: `fin-${field}-deps`,
            operator: "and" as const,
            rules: parents.map((p) => ({
                id: `fin-${field}-dep-${p.field}`,
                field: p.field,
                operator: "equals" as const,
                value: p.value,
            })),
            groups: [],
        },
    };
}

function FinanceUnitCostFilterBar({
    value,
    onChange,
    onApply,
    onClear,
    resolveLanguageKey,
    lockedUnitId,
}: FinanceUnitCostFilterBarProps) {
    const str = (key: string) => String(resolveLanguageKey(key));

    const verificationOptions = [
        { value: "", label: str("financeFilters.any") },
        ...UNIT_COST_VERIFICATION_STATUS_VALUES.map((v) => ({
            value: v,
            label: str(`financeFilters.verification.${v}`),
        })),
    ];
    const paymentOptions = [
        { value: "", label: str("financeFilters.any") },
        ...UNIT_COST_PAYMENT_STATUS_VALUES.map((v) => ({
            value: v,
            label: str(`financeFilters.payment.${v}`),
        })),
    ];

    const patch = (partial: Partial<FinanceToolbarValues>) => onChange({ ...value, ...partial });

    const projectParents: Array<{field: string; value: string}> = [];
    const edificeParents = value.project ? [{field: "project", value: value.project}] : [];
    const floorParents = [
        ...(value.edifice ? [{field: "edifice", value: value.edifice}] : []),
        ...(value.project ? [{field: "project", value: value.project}] : []),
    ];
    const unitParents = [
        ...(value.floor ? [{field: "floor", value: value.floor}] : []),
        ...(value.edifice ? [{field: "edifice", value: value.edifice}] : []),
        ...(value.project ? [{field: "project", value: value.project}] : []),
    ];

    return (
        <Card>
            <CardContent className="flex flex-wrap items-end gap-3 pt-4">
                {!lockedUnitId && (
                    <>
                        <div className="flex min-w-[180px] max-w-[min(100vw,280px)] flex-1 flex-col gap-2">
                            <Label className="text-muted-foreground">{str("financeFilters.project")}</Label>
                            <ApiSelect
                                key={`project-${value.project || "none"}`}
                                apiUrl="/api/realEstate/project/select"
                                postBody={depFilters("project", projectParents)}
                                placeholder={str("financeFilters.projectPlaceholder")}
                                value={value.project || undefined}
                                onValueChange={(v: string) =>
                                    patch({
                                        project: v || "",
                                        edifice: "",
                                        floor: "",
                                        unit: "",
                                    })
                                }
                                pageSize={50}
                                className="w-full"
                                resolveLanguageKey={resolveLanguageKey}
                            />
                        </div>
                        <div className="flex min-w-[180px] max-w-[min(100vw,280px)] flex-1 flex-col gap-2">
                            <Label className="text-muted-foreground">{str("financeFilters.edifice")}</Label>
                            <ApiSelect
                                key={`edifice-${value.project || "none"}`}
                                apiUrl="/api/realEstate/edifice/select"
                                postBody={depFilters("edifice", edificeParents)}
                                placeholder={str("financeFilters.edificePlaceholder")}
                                value={value.edifice || undefined}
                                onValueChange={(v: string) =>
                                    patch({
                                        edifice: v || "",
                                        floor: "",
                                        unit: "",
                                    })
                                }
                                disabled={!value.project}
                                pageSize={50}
                                className="w-full"
                                resolveLanguageKey={resolveLanguageKey}
                            />
                        </div>
                        <div className="flex min-w-[160px] max-w-[min(100vw,240px)] flex-1 flex-col gap-2">
                            <Label className="text-muted-foreground">{str("financeFilters.floor")}</Label>
                            <ApiSelect
                                key={`floor-${value.edifice || value.project || "none"}`}
                                apiUrl="/api/realEstate/floor/select"
                                postBody={depFilters("floor", floorParents)}
                                placeholder={str("financeFilters.floorPlaceholder")}
                                value={value.floor || undefined}
                                onValueChange={(v: string) =>
                                    patch({
                                        floor: v || "",
                                        unit: "",
                                    })
                                }
                                disabled={!value.edifice && !value.project}
                                pageSize={50}
                                className="w-full"
                                resolveLanguageKey={resolveLanguageKey}
                            />
                        </div>
                        <div className="flex min-w-[180px] max-w-[min(100vw,280px)] flex-1 flex-col gap-2">
                            <Label className="text-muted-foreground">{str("financeFilters.unit")}</Label>
                            <ApiSelect
                                key={`unit-${value.floor || value.edifice || value.project || "none"}`}
                                apiUrl="/api/realEstate/unit/select"
                                postBody={depFilters("unit", unitParents)}
                                placeholder={str("financeFilters.unitPlaceholder")}
                                value={value.unit || undefined}
                                onValueChange={(v: string) => patch({ unit: v || "" })}
                                disabled={!value.project && !value.edifice && !value.floor}
                                pageSize={50}
                                className="w-full"
                                resolveLanguageKey={resolveLanguageKey}
                            />
                        </div>
                    </>
                )}
                <div className="flex min-w-40 max-w-[min(100vw,240px)] flex-1 flex-col gap-2">
                    <Label className="text-muted-foreground">{str("financeFilters.verificationLabel")}</Label>
                    <SimpleSelect
                        options={verificationOptions}
                        value={value.verificationStatus}
                        onValueChange={(v: string | string[]) => patch({ verificationStatus: typeof v === "string" ? v : "" })}
                        placeholder={str("financeFilters.any")}
                        className="w-full"
                        resolveLanguageKey={resolveLanguageKey}
                    />
                </div>
                <div className="flex min-w-40 max-w-[min(100vw,240px)] flex-1 flex-col gap-2">
                    <Label className="text-muted-foreground">{str("financeFilters.paymentLabel")}</Label>
                    <SimpleSelect
                        options={paymentOptions}
                        value={value.paymentStatus}
                        onValueChange={(v: string | string[]) => patch({ paymentStatus: typeof v === "string" ? v : "" })}
                        placeholder={str("financeFilters.any")}
                        className="w-full"
                        resolveLanguageKey={resolveLanguageKey}
                    />
                </div>
                <div className="flex min-w-[180px] max-w-[min(100vw,280px)] flex-1 flex-col gap-2">
                    <Label className="text-muted-foreground">{str("financeFilters.vendorLabel")}</Label>
                    <Input
                        value={value.vendorContains}
                        placeholder={str("financeFilters.vendorPlaceholder")}
                        onChange={(e) => patch({ vendorContains: e.target.value })}
                    />
                </div>
                <div className="flex min-w-[200px] max-w-[min(100vw,320px)] flex-1 flex-col gap-2">
                    <Label className="text-muted-foreground">{str("financeFilters.purchaserLabel")}</Label>
                    <ApiSelect
                        apiUrl="/api/company/users/select"
                        postBody={{ administration: true }}
                        placeholder={str("financeFilters.purchaserPlaceholder")}
                        value={value.purchasePersonId || undefined}
                        onValueChange={(v: string) => patch({ purchasePersonId: v })}
                        pageSize={50}
                        className="w-full"
                        resolveLanguageKey={resolveLanguageKey}
                    />
                </div>
                <div className="flex shrink-0 gap-2 pb-0.5">
                    <Button type="button" variant="secondary" onClick={onApply}>
                        {str("financeFilters.apply")}
                    </Button>
                    <Button type="button" variant="outline" onClick={onClear}>
                        {str("financeFilters.clear")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default FinanceUnitCostFilterBar;
