import type {CompoundFormWidgetRenderer} from "@coreModule/helpers/types/widgetContribution.types.ts";
import type {Unit as UnitDto} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/unit/unit.dto.ts";

/** Polygon editors: language key props plus the form paths they read and write. */
const polygonEditor: CompoundFormWidgetRenderer = ({Widget, binding, resolveLanguageKey, extra}) => {
    const wp = binding.widgetProps ?? {};
    return (
        <Widget
            resolveLanguageKey={resolveLanguageKey}
            loading={extra?.loading ?? false}
            formExtras={extra?.formExtras}
            polygonField={wp.polygonField}
            closedField={wp.closedField}
            projectField={wp.projectField}
            edificeField={wp.edificeField}
            floorField={wp.floorField}
            hintKey={wp.hintKey}
            errorTitleKey={wp.errorTitleKey}
            errorLoadingKey={wp.errorLoadingKey}
            noImageKey={wp.noImageKey}
        />
    );
};

const labelOf = (label: string | undefined, t: (key: string) => unknown) => (label ? String(t(label)) : undefined);

/** Expenditure line items: `widgetProps.name` may point it at another array. */
const expenditureItems: CompoundFormWidgetRenderer = ({Widget, binding, resolveLanguageKey, extra}) => (
    <Widget
        resolveLanguageKey={resolveLanguageKey}
        loading={extra?.loading ?? false}
        formExtras={extra?.formExtras}
        name={(binding.widgetProps?.name as string | undefined) ?? binding.name}
        label={labelOf(binding.label, resolveLanguageKey)}
    />
);

/** Installment schedule: widget props are forwarded and win. */
const paymentPlanInstallments: CompoundFormWidgetRenderer = ({Widget, binding, resolveLanguageKey, extra}) => (
    <Widget
        name={binding.name}
        label={labelOf(binding.label, resolveLanguageKey)}
        resolveLanguageKey={resolveLanguageKey}
        loading={extra?.loading ?? false}
        {...binding.widgetProps}
    />
);

/**
 * `#UnitCard` inside a form: the unit snapshot the page stored in form extras
 * (`widgetProps.formExtraUnitKey`, default `cashSaleUnitSnapshot`), in a sticky panel.
 */
const unitCard: CompoundFormWidgetRenderer = ({Widget, binding, extra}) => {
    const wp = binding.widgetProps ?? {};
    const extraKey =
        typeof wp.formExtraUnitKey === "string" && wp.formExtraUnitKey.length > 0 ? wp.formExtraUnitKey : "cashSaleUnitSnapshot";
    const unit = extra?.formExtras?.[extraKey] as UnitDto | null | undefined;
    if (!unit?._id) return null;
    const wrapperClass =
        typeof wp.wrapperClassName === "string" && wp.wrapperClassName.length > 0
            ? wp.wrapperClassName
            : "md:sticky md:top-4 max-h-[min(85vh,900px)] overflow-y-auto rounded-lg";
    return (
        <div className={wrapperClass}>
            <Widget
                unit={unit}
                projectId={unit.project?._id}
                projectName={unit.project?.name}
                edificeId={unit.edifice?._id}
                edificeName={unit.edifice?.name}
                floorId={unit.floor?._id}
                floorName={unit.floor?.name}
                hideActions={wp.hideActions !== false}
                small={wp.small === true}
            />
        </div>
    );
};

export const propertyManagementFormWidgetRenderers: Record<string, CompoundFormWidgetRenderer> = {
    "#FormFloorPolygon": polygonEditor,
    "#FormEdificePolygon": polygonEditor,
    "#FormUnitPolygon": polygonEditor,
    "#FormExpenditureItemsField": expenditureItems,
    "#PaymentPlanInstallmentsField": paymentPlanInstallments,
    "#UnitCard": unitCard,
};

/** Edit-form write keys for widgets whose field name is not a schema path. */
export const propertyManagementFormWriteAccessKeys: Record<string, string> = {
    "#FormFloorPolygon": "polygonCoordinates",
    "#FormEdificePolygon": "polygonCoordinates",
    "#FormUnitPolygon": "polygonCoordinates",
    "#FormExpenditureItemsField": "expenditureItems",
};
