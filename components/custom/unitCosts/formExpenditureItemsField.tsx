import {useFieldArray, useFormContext} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@coreModule/components/ui/form.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {SimpleSelect} from "@coreModule/components/custom/simpleSelect";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {EXPENDITURE_CATEGORY_VALUES, MAX_MEDIA_FILES_PER_EXPENDITURE_LINE, MEASURE_UNIT_VALUES} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unitCost/unitCost.constants.ts";
import {Trash2, Plus} from "lucide-react";
import FormMultiLocalFileField from "@coreModule/components/custom/files/formMultiLocalFileField.tsx";
import {compose} from "redux";
import withLanguage from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";

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
                            <Trash2 className="h-4 w-4" />
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
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() =>
                    append({
                        title: "",
                        category: EXPENDITURE_CATEGORY_VALUES[0],
                        unit: MEASURE_UNIT_VALUES[0],
                        amount: 1,
                        pricePerUnit: "",
                        media: [],
                    })
                }
            >
                <Plus className="h-4 w-4 mr-1" />
                {resolveLanguageKey("addExpenditureLine")}
            </Button>
        </div>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/unitCosts/formExpenditureItemsField.tsx"),
    withDebug(true, true, "unitCosts"),
)(FormExpenditureItemsFieldInner);
