// The propertyManagement form-widget renderers (moved out of core viewEngine tests, TD-M04).
import {describe, expect, it} from "vitest";
import type {ComponentType} from "react";
import {render} from "@testing-library/react";
import type {FieldBinding} from "armonia/src/modules/core/api/auxiliary/private/viewConfig";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {propertyManagementFormWidgetRenderers as renderers, propertyManagementFormWriteAccessKeys} from "@propertyManagementModule/clients/panel/formWidgetRenderers.tsx";

const calls: Record<string, unknown>[] = [];
const W: ComponentType<Record<string, unknown>> = (props) => {
    calls.push(props);
    return <div data-probe="W" />;
};
const t = ((key: string) => `t:${key}`) as ResolveLanguageKey;
const bind = (widget: string, widgetProps: Record<string, unknown> = {}, extra: Partial<FieldBinding> = {}): FieldBinding =>
    ({name: "f", widget, widgetProps, ...extra}) as FieldBinding;

function mount(binding: FieldBinding, extra: Record<string, unknown> = {}) {
    const renderer = renderers[binding.widget]!;
    const result = render(<>{renderer({Widget: W, binding, resolveLanguageKey: t, extra})}</>);
    return {props: calls.at(-1), container: result.container};
}

describe("propertyManagement form widget renderers", () => {
    it("polygon and item widgets get their keys", () => {
        expect(mount(bind("#FormFloorPolygon", {polygonField: "p", closedField: "c"})).props).toMatchObject({polygonField: "p", closedField: "c", resolveLanguageKey: t});
        expect(mount(bind("#FormEdificePolygon", {errorTitleKey: "e"})).props).toMatchObject({errorTitleKey: "e"});
        expect(mount(bind("#FormUnitPolygon", {edificeField: "ed"})).props).toMatchObject({edificeField: "ed"});
        expect(mount(bind("#FormExpenditureItemsField", {}, {label: "items"})).props).toMatchObject({name: "f", label: "t:items"});
        expect(mount(bind("#FormExpenditureItemsField", {name: "other"})).props).toMatchObject({name: "other", label: undefined});
        expect(mount(bind("#PaymentPlanInstallmentsField", {name: "wp-wins"}, {label: "plan"})).props).toMatchObject({name: "wp-wins", label: "t:plan"});
    });

    it("#UnitCard renders the unit snapshot from form extras, or nothing", () => {
        const unit = {_id: "u1", project: {_id: "p", name: "P"}, edifice: {_id: "e", name: "E"}, floor: {_id: "f", name: "F"}};
        const {props, container} = mount(bind("#UnitCard", {small: true}), {formExtras: {cashSaleUnitSnapshot: unit}});
        expect(props).toMatchObject({unit, projectId: "p", edificeName: "E", floorId: "f", hideActions: true, small: true});
        expect(container.firstElementChild?.className).toContain("md:sticky");
        expect(renderers["#UnitCard"]!({Widget: W, binding: bind("#UnitCard", {formExtraUnitKey: "other"}), resolveLanguageKey: t, extra: {formExtras: {cashSaleUnitSnapshot: unit}}})).toBeNull();
    });

    it("polygon editors gate on polygonCoordinates, expenditure items on expenditureItems", () => {
        expect(propertyManagementFormWriteAccessKeys["#FormFloorPolygon"]).toBe("polygonCoordinates");
        expect(propertyManagementFormWriteAccessKeys["#FormExpenditureItemsField"]).toBe("expenditureItems");
    });
});
