import {useEffect, useState} from "react";
import {useFieldArray, useFormContext, useWatch} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@coreModule/components/ui/form.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {SimpleSelect} from "@coreModule/components/viewEngine/widgets/inputs/simpleSelect.tsx";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {EXPENDITURE_CATEGORY_VALUES, MAX_MEDIA_FILES_PER_EXPENDITURE_LINE, MEASURE_UNIT_VALUES} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.constants.ts";
import {IconPlus, IconTrash} from "@tabler/icons-react";
import FormMultiLocalFileField from "@coreModule/components/viewEngine/widgets/media/formMultiLocalFileField.tsx";
import {compose} from "redux";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {displayPlainText} from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import type {Currency} from "armonia/src/modules/core/api/finance/private/currency/currency.dto.ts";
import {expenditureTotals} from "@propertyManagementModule/helpers/components/unitCosts/expenditureTotals.ts";

const CURRENCY_REQUEST: HttpRequest = {method: "post", url: "/api/finance/currency/single"};

/** The form's picked currency, loaded so the running totals carry its symbol (UX-07). */
function usePickedCurrency(currencyId: unknown): Currency | undefined {
    const [currency, setCurrency] = useState<Currency>();
    const [requestCount, setRequestCount] = useState(0);
    const id = typeof currencyId === "string" ? currencyId : "";
    useEffect(() => {
        if (id) setRequestCount((count) => count + 1);
        else setCurrency(undefined);
    }, [id]);
    useHttpRequest<Currency>(CURRENCY_REQUEST, {_id: id}, requestCount, true, {success: setCurrency});
    return currency;
}

function LineFieldMessage() {
    return (
        <div className="min-h-5">
            <FormMessage />
        </div>
    );
}

export type FormExpenditureItemsFieldProps = {
    name?: string;
    label?: string;
    resolveLanguageKey: ResolveLanguageKey;
    loading?: boolean;
    formExtras?: Record<string, unknown>;
};

function FormExpenditureItemsFieldInner({
    name = "expenditureItems",
    label,
    resolveLanguageKey,
    formExtras,
}: FormExpenditureItemsFieldProps) {
    const {control} = useFormContext();
    const {fields, append, remove} = useFieldArray({control, name});
    // Running line totals and subtotal as the lines are typed, in the cost's currency (UX-07, D35).
    const lines = useWatch({control, name});
    const currency = usePickedCurrency(useWatch({control, name: "currency"}));
    const {lineTotals, subtotal} = expenditureTotals(Array.isArray(lines) ? lines : [], currency?.decimalPlaces);
    const money = (amount: number) => displayPlainText({amount, currency}, "currency");

    const categoryOptions = EXPENDITURE_CATEGORY_VALUES.map((v) => ({
        value: v,
        label: String(resolveLanguageKey(`expenditureCategory.${v}`)),
    }));
    const unitOptions = MEASURE_UNIT_VALUES.map((v) => ({
        value: v,
        label: String(resolveLanguageKey(`measureUnit.${v}`)),
    }));

    return (
        <div className="flex flex-col col-span-full gap-y-3 w-full">
            {label ? <p className="text-sm font-medium">{label}</p> : null}
            {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col rounded-lg border border-border/60 p-3 gap-y-2 bg-muted/20">
                    <div className="flex justify-between items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                            {resolveLanguageKey("expenditureLine")} #{index + 1}
                        </span>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(index)}>
                            <IconTrash className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 items-start">
                        <FormField
                            control={control}
                            name={`${name}.${index}.title`}
                            render={({field: f}) => (
                                <FormItem>
                                    <FormLabel>{resolveLanguageKey("lineDescription")}</FormLabel>
                                    <FormControl>
                                        <Input {...f} value={f.value ?? ""} />
                                    </FormControl>
                                    <LineFieldMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`${name}.${index}.category`}
                            render={({field: f}) => (
                                <FormItem>
                                    <FormLabel>{resolveLanguageKey("category")}</FormLabel>
                                    <FormControl>
                                        <SimpleSelect
                                            value={typeof f.value === "string" ? f.value : ""}
                                            onValueChange={f.onChange}
                                            options={categoryOptions}
                                            placeholder={resolveLanguageKey("selectCategory")}
                                            className="grow w-full"
                                        />
                                    </FormControl>
                                    <LineFieldMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`${name}.${index}.unit`}
                            render={({field: f}) => (
                                <FormItem>
                                    <FormLabel>{resolveLanguageKey("measureUnitLabel")}</FormLabel>
                                    <FormControl>
                                        <SimpleSelect
                                            value={typeof f.value === "string" ? f.value : ""}
                                            onValueChange={f.onChange}
                                            options={unitOptions}
                                            placeholder={resolveLanguageKey("selectUnit")}
                                            className="grow w-full"
                                        />
                                    </FormControl>
                                    <LineFieldMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`${name}.${index}.amount`}
                            render={({field: f}) => (
                                <FormItem>
                                    <FormLabel>{resolveLanguageKey("quantity")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="any"
                                            {...f}
                                            value={f.value === undefined || f.value === null ? "" : f.value}
                                            onChange={(e) => f.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <LineFieldMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`${name}.${index}.pricePerUnit`}
                            render={({field: f}) => (
                                <FormItem>
                                    <FormLabel>{resolveLanguageKey("pricePerUnit")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="any"
                                            {...f}
                                            value={f.value === undefined || f.value === null ? "" : f.value}
                                            onChange={(e) => f.onChange(e.target.value)}
                                        />
                                    </FormControl>
                                    <LineFieldMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {lineTotals[index] !== undefined ? (
                        <p className="self-end text-sm tabular-nums text-muted-foreground">
                            {resolveLanguageKey("lineTotal")}: <span className="font-medium text-foreground">{money(lineTotals[index])}</span>
                        </p>
                    ) : null}
                    <div className="col-span-full pt-1 border-t border-border/40 mt-1">
                        <FormMultiLocalFileField
                            name={`${name}.${index}.media`}
                            resolveLanguageKey={resolveLanguageKey}
                            maxFiles={MAX_MEDIA_FILES_PER_EXPENDITURE_LINE}
                            showLabel={true}
                            labelKey="form.productMediaLabel"
                            formExtras={formExtras}
                            existingListExtraKey={
                                formExtras?.editUnitCostAllLineMedia != null ? "editUnitCostAllLineMedia" : undefined
                            }
                            existingFilesLabelKey="form.existingFilesLabel"
                            newFilesLabelKey="form.newFilesLabel"
                            addFileKey="form.addFile"
                            filesSelectedKey="form.filesSelected"
                        />
                    </div>
                </div>
            ))}
            {fields.length > 0 ? (
                <p className="self-end text-sm tabular-nums">
                    {resolveLanguageKey("subtotal")}: <span className="font-semibold">{money(subtotal)}</span>
                </p>
            ) : null}
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() =>
                    // Category and unit start empty for the user to pick (UX-06); saving refuses a line without them.
                    append({
                        title: "",
                        category: "",
                        unit: "",
                        amount: 1,
                        pricePerUnit: "",
                        media: [],
                    })
                }
            >
                <IconPlus className="h-4 w-4 mr-1" />
                {resolveLanguageKey("addExpenditureLine")}
            </Button>
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/unitCosts/formExpenditureItemsField.tsx"),
    withDebug(true, true, "unitCosts"),
)(FormExpenditureItemsFieldInner);
