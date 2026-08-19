import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useImperativeHandle, useState, useRef, useEffect} from "react";
import {FinanceModificationRequestFormType} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/financeModificationRequest.form.type.ts";
import {LoaderCircle, DollarSign, Plus, X, AlertTriangle} from "lucide-react";
import {
    AlertDialog, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@coreModule/components/ui/alert-dialog.tsx";
import {ModificationRequest} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/modificationRequest.dto.ts";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@coreModule/components/ui/form.tsx";
import {ApiSelect} from "@coreModule/components/custom/apiSelect";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@coreModule/components/ui/table/table.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {z} from "zod";
import {DateInput} from "@coreModule/components/custom/dateInput.tsx";
import {isValid} from "date-fns";
import SingleFile from "@coreModule/components/custom/files/singleFile.tsx";
import {financeModificationRequestFormSchema} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/modificationRequest/fiinanceModificationRequest.form.validator.ts";

type FinanceZodFormValues = z.infer<ReturnType<typeof financeModificationRequestFormSchema>>;
type FinanceFormValues = Omit<FinanceZodFormValues, "media">;
type CostBreakdownItem = (NonNullable<FinanceFormValues["costBreakdown"]>[number]) & {source?: "engineer_material" | "manual"};

type FinanceModificationRequestDialogProps = WithLanguageType & WithAxiosType<any, FinanceModificationRequestFormType> & {
    open: boolean;
    onClose: () => void;
    request: ModificationRequest;
    onSuccess?: (updated?: ModificationRequest) => void;
}

function costItemQuantity(item: Pick<CostBreakdownItem, "quantity">): number {
    const q = Number(item.quantity);
    return item.quantity != null && String(item.quantity).trim() !== "" && !Number.isNaN(q) ? q : 1;
}

function formatLineTotal(item: Pick<CostBreakdownItem, "cost" | "quantity">): string {
    const cost = item.cost != null && !Number.isNaN(Number(item.cost)) ? Number(item.cost) : NaN;
    if (Number.isNaN(cost)) return "—";
    const qty = costItemQuantity(item);
    return (cost * qty).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function FinanceModificationRequestDialog({
    open,
    onClose,
    request,
    resolveLanguageKey,
    innerRef,
    onPost,
    onSuccess = () => {},
    loading,
    languageCode,
}: FinanceModificationRequestDialogProps) {
    const [costBreakdown, setCostBreakdown] = useState<CostBreakdownItem[]>([]);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const mediaInputRef = useRef<HTMLInputElement>(null);

    const formSchema = financeModificationRequestFormSchema(languageCode, resolveLanguageKey("form"));
    const form = useForm<FinanceFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            _id: request._id,
            costBreakdown: [],
            currency: "",
        },
    });

    useEffect(() => {
        const seeded = (request.engineerApproval?.materialsPlan || []).map((item: any) => ({
            item: item.item || "",
            cost: 0,
            quantity: item.quantity,
            unit: item.unit,
            source: "engineer_material" as const
        }));
        if (seeded.length > 0) {
            setCostBreakdown(seeded);
        }
    }, [request._id, request.engineerApproval?.materialsPlan]);

    useImperativeHandle(innerRef, () => ({
        success: (data: FinanceModificationRequestFormType) => {
            onSuccess?.(data as unknown as ModificationRequest);
            onClose();
            form.reset();
            setCostBreakdown([]);
            setMediaFiles([]);
        }
    }));

    const handleOpenChange = (next: boolean) => {
        if (!next && !loading) onClose();
    };

    const handleSubmit = () => {
        form.setValue(
            "costBreakdown",
            costBreakdown.length > 0
                ? costBreakdown.map((item) => ({
                    item: item.item,
                    cost: item.cost ?? 0,
                    quantity: item.quantity,
                    unit: item.unit,
                }))
                : undefined,
        );
        form.handleSubmit((data) => {

            if (hasMismatch) return;

            const totalCostNum = Number(data.totalCost);
            onPost({
                _id: data._id,
                totalCost: Number.isNaN(totalCostNum) ? 0 : totalCostNum,
                currency: data.currency,
                costBreakdown: costBreakdown.length > 0
                    ? costBreakdown.map((item) => ({...item, cost: item.cost ?? 0, source: item.source || "manual"}))
                    : undefined,
                notes: data.notes || undefined,
                estimatedCompletionDate: data.estimatedCompletionDate || undefined,
                media: mediaFiles.length > 0 ? mediaFiles as unknown as string[] : undefined,
            } as FinanceModificationRequestFormType);
        })();
    };

    const addCostBreakdownItem = () => {
        setCostBreakdown([...costBreakdown, {item: "", cost: 0, quantity: undefined, unit: undefined}]);
    };

    const removeCostBreakdownItem = (index: number) => {
        setCostBreakdown(costBreakdown.filter((_, i) => i !== index));
    };

    const updateCostBreakdownItem = (index: number, field: keyof CostBreakdownItem, value: string | number | undefined) => {
        const updated = [...costBreakdown];
        updated[index] = { ...updated[index], [field]: value };
        setCostBreakdown(updated);
    };

    const handleMediaFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const maxMedia = 20;
            const totalMedia = mediaFiles.length;
            const remainingSlots = maxMedia - totalMedia;
            const filesToAdd = files.slice(0, remainingSlots);
            setMediaFiles(prev => [...prev, ...filesToAdd]);
        }
        if (e.target) {
            e.target.value = '';
        }
    };

    const removeMediaFile = (index: number) => {
        setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    };

    const totalCost = Number(form.watch("totalCost")) || 0;
    const breakdownSum = costBreakdown.reduce((sum, item) => {
        const cost = item.cost != null && !Number.isNaN(Number(item.cost)) ? Number(item.cost) : 0;
        return sum + cost * costItemQuantity(item);
    }, 0);
    const difference = totalCost - breakdownSum;
    const hasMismatch = (Number.isNaN(difference) || Math.abs(difference) > 0.001);

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
                <AlertDialogContent className="max-w-7xl min-w-[40vw] w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
                    <AlertDialogHeader className="flex flex-col shrink-0 gap-y-2">
                        <AlertDialogTitle>{resolveLanguageKey("title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {resolveLanguageKey("description")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Form {...form}>
                        <form
                            id="finance-form"
                            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4 pr-1"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}
                        >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="totalCost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{resolveLanguageKey("form.totalCostLabel")} *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder={resolveLanguageKey("form.totalCostPlaceholder")}
                                                        disabled={loading}
                                                        value={field.value ?? ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value ? parseFloat(value) : 0);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{resolveLanguageKey("form.currencyLabel")} *</FormLabel>
                                                <FormControl>
                                                    <ApiSelect
                                                        apiUrl="/api/finance/currency/select"
                                                        method="GET"
                                                        value={field.value}
                                                        onValueChange={(value: string) => field.onChange(value)}
                                                        placeholder={resolveLanguageKey("form.currencyPlaceholder")}
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="min-w-0">
                                <Label className="mb-2 block">{resolveLanguageKey("form.costBreakdownLabel")}</Label>
                                <div className="rounded-md border">
                                    <Table className="table-fixed w-full text-xs">
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="w-[22%] min-w-0 p-2 align-middle">{resolveLanguageKey("form.itemLabel")}</TableHead>
                                                <TableHead className="w-[14%] min-w-0 p-2 align-middle">{resolveLanguageKey("form.costPerItemLabel")}</TableHead>
                                                <TableHead className="w-[10%] min-w-0 p-2 align-middle">{resolveLanguageKey("form.quantityLabel")}</TableHead>
                                                <TableHead className="w-[12%] min-w-0 p-2 align-middle">{resolveLanguageKey("form.unitLabel")}</TableHead>
                                                <TableHead className="w-[14%] min-w-0 p-2 align-middle text-end">{resolveLanguageKey("form.lineTotalLabel")}</TableHead>
                                                <TableHead className="w-[8%] min-w-0 p-2 align-middle text-end"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {costBreakdown.length === 0 && (
                                                <TableRow className="hover:bg-transparent">
                                                    <TableCell colSpan={6} className="py-4 text-center text-muted-foreground">
                                                        {resolveLanguageKey("form.emptyBreakdownHint")}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {costBreakdown.map((item, index) => (
                                                <TableRow key={index} className="hover:bg-transparent">
                                                    <TableCell className="min-w-0 p-1.5 align-middle">
                                                        <Input
                                                            placeholder={resolveLanguageKey("form.itemLabel")}
                                                            value={item.item}
                                                            onChange={(e) => updateCostBreakdownItem(index, "item", e.target.value)}
                                                            disabled={loading}
                                                            className="h-8 min-w-0 px-2 text-xs"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="min-w-0 p-1.5 align-middle">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="0"
                                                            value={item.cost ?? ""}
                                                            onChange={(e) => updateCostBreakdownItem(index, "cost", parseFloat(e.target.value) || 0)}
                                                            disabled={loading}
                                                            className="h-8 min-w-0 px-2 text-xs"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="min-w-0 p-1.5 align-middle">
                                                        <Input
                                                            type="number"
                                                            step="1"
                                                            placeholder="1"
                                                            value={item.quantity ?? ""}
                                                            onChange={(e) => updateCostBreakdownItem(index, "quantity", parseFloat(e.target.value) || undefined)}
                                                            disabled={loading}
                                                            className="h-8 min-w-0 px-2 text-xs"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="min-w-0 p-1.5 align-middle">
                                                        <Input
                                                            placeholder="—"
                                                            value={item.unit ?? ""}
                                                            onChange={(e) => updateCostBreakdownItem(index, "unit", e.target.value)}
                                                            disabled={loading}
                                                            className="h-8 min-w-0 px-2 text-xs"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="min-w-0 p-1.5 align-middle text-end font-medium tabular-nums text-foreground">
                                                        {formatLineTotal(item)}
                                                    </TableCell>
                                                    <TableCell className="p-1.5 align-middle text-end">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeCostBreakdownItem(index)}
                                                            disabled={loading}
                                                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                                                        >
                                                            <X size={16} />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {resolveLanguageKey("form.breakdownTotal")}: {breakdownSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                    {
                                        hasMismatch && (
                                        <span className={cn(
                                            "flex items-center gap-1.5 text-sm font-medium",
                                            difference > 0 ? "text-warning" : "text-destructive"
                                        )}>
                                            <AlertTriangle size={16} />
                                            {resolveLanguageKey("form.difference")}: {difference > 0 ? "+" : ""}{difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addCostBreakdownItem}
                                    disabled={loading}
                                    className="mt-2"
                                    size="sm"
                                >
                                    <Plus size={16} className="mr-2" />
                                    {resolveLanguageKey("form.addLineItem")}
                                </Button>
                            </div>

                            <div>
                                <Label className="mb-2 block">{resolveLanguageKey("form.mediaLabel")}</Label>
                                <input
                                    ref={mediaInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="*/*"
                                    multiple
                                    onChange={handleMediaFilesChange}
                                    disabled={loading || mediaFiles.length >= 20}
                                />
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => mediaInputRef.current?.click()}
                                            disabled={loading || mediaFiles.length >= 20}
                                        >
                                            <Plus size={16} className="mr-2" />
                                            {resolveLanguageKey("form.addFile")}
                                        </Button>
                                        {mediaFiles.length > 0 && (
                                            <span className="text-sm text-muted-foreground">
                                                {mediaFiles.length}/20 {resolveLanguageKey("form.filesSelected")}
                                            </span>
                                        )}
                                    </div>
                                    {mediaFiles.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {mediaFiles.map((file, index) => (
                                                <SingleFile
                                                    key={`finance-media-${index}-${file.name}`}
                                                    file={{
                                                        id: `temp-finance-${index}`,
                                                        file,
                                                        path: URL.createObjectURL(file),
                                                        body: undefined,
                                                    }}
                                                    canDownload={true}
                                                    canRemove={true}
                                                    isBig={false}
                                                    onRemove={() => removeMediaFile(index)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{resolveLanguageKey("form.notesLabel")}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={resolveLanguageKey("form.notesPlaceholder")}
                                                disabled={loading}
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                className="min-h-[100px] max-h-[150px] resize-none overflow-y-auto"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="estimatedCompletionDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{resolveLanguageKey("form.estimatedCompletionDateLabel")}</FormLabel>
                                        <FormControl>
                                            <DateInput
                                                disabled={loading}
                                                placeholder={resolveLanguageKey("form.estimatedCompletionDatePlaceholder")}
                                                className="h-9 w-full sm:max-w-xs"
                                                value={
                                                    field.value
                                                        ? (() => {
                                                            const d = new Date(field.value);
                                                            return isValid(d) ? d : undefined;
                                                        })()
                                                        : undefined
                                                }
                                                onChange={(d) => {
                                                    field.onChange(d && isValid(d) ? d.toISOString() : undefined);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                    <AlertDialogFooter className="mt-4 shrink-0 border-t border-border pt-4">
                        <AlertDialogCancel disabled={loading} onClick={() => {
                            form.reset();
                            setCostBreakdown([]);
                            setMediaFiles([]);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSubmit();
                            }}
                            form="finance-form"
                            disabled={loading || hasMismatch}
                            className="bg-success text-success-foreground hover:bg-success"
                        >
                            {loading ? <LoaderCircle className="animate-spin" size={16} /> : <DollarSign size={16} className="" />}
                            {resolveLanguageKey("confirmButton")}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/propertyManagement/components/custom/modificationRequests/financeModificationRequestDialog.tsx"),
    withAxios(
        {
            method: "post",
            url: "/api/realEstate/unit/modificationRequest/finance",
            data: {}
        },
        true
    ),
    withDebug(true, true, "modificationRequests")
)(FinanceModificationRequestDialog);
