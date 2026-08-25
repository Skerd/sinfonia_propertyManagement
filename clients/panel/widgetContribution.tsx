import {createElement, lazy, type ComponentType} from "react";
import type {WidgetContribution} from "@coreModule/clients/panel/moduleContributions/widgetContribution.types.ts";
import {
    hasAccessPath,
    normalizeObjectIdRef,
    resolvePath,
} from "@coreModule/components/viewEngine/viewRendererHelpers.ts";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import FormFloorPolygon from "@propertyManagementModule/components/custom/floors/formFloorPolygon.tsx";
import FormEdificePolygon from "@propertyManagementModule/components/custom/edifices/formEdificePolygon.tsx";
import FormUnitPolygon from "@propertyManagementModule/components/custom/units/formUnitPolygon.tsx";
import SheetPriceHistoryChart from "@propertyManagementModule/components/custom/units/sheetPriceHistoryChart.tsx";
import type {SheetPriceHistoryChartProps} from "@propertyManagementModule/components/custom/units/sheetPriceHistoryChart.tsx";
import PaymentPlanInstallmentsField from "@propertyManagementModule/components/custom/paymentPlan/paymentPlanInstallmentsField.tsx";
import UnitCard from "@propertyManagementModule/clients/panel/private/units/center/cardView/unitCard.tsx";
import FormExpenditureItemsField from "@propertyManagementModule/components/custom/unitCosts/formExpenditureItemsField.tsx";
import SheetLineItems from "@propertyManagementModule/components/custom/lineItems/sheetLineItems.tsx";
import {createSheetLineItems} from "@propertyManagementModule/components/custom/lineItems/createSheetLineItems.tsx";
import InspectionCard from "@propertyManagementModule/clients/panel/private/inspections/center/cardView/inspectionCard.tsx";
import UnitCostCard from "@propertyManagementModule/clients/panel/private/unitCosts/center/cardView/unitCostCard.tsx";
import ModificationRequestCard from "@propertyManagementModule/clients/panel/private/modificationRequests/center/cardView/modificationRequestCard.tsx";
import EdificeCard from "@propertyManagementModule/clients/panel/private/edifices/center/cardView/edificeCard.tsx";
import SaleCard from "@propertyManagementModule/clients/panel/private/sales/center/cardView/saleCard.tsx";
import PaymentPlanCard from "@propertyManagementModule/clients/panel/private/sales/center/cardView/paymentPlanCard.tsx";
import ReservationCard from "@propertyManagementModule/clients/panel/private/reservations/center/cardView/reservationCard.tsx";
import type {Sale} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/sale/sale.dto.ts";
import type {Reservation} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/reservation/reservation.dto.ts";
import type {PaymentPlan} from "armonia/src/modules/propertyManagement/api/realEstate/private/unit/paymentPlan/paymentPlan.dto.ts";

const ProjectSheetViewLazy = lazy(
    () => import("@propertyManagementModule/clients/panel/private/projects/center/sheetView/projectSheetView.tsx"),
);
const ConstructionUpdateSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/constructionUpdates/center/sheetView/constructionUpdateSheetView.tsx"
        ),
);
const StorySheetViewLazy = lazy(
    () => import("@propertyManagementModule/clients/panel/private/stories/center/sheetView/storySheetView.tsx"),
);
const SnagSheetViewLazy = lazy(
    () => import("@propertyManagementModule/clients/panel/private/snags/center/sheetView/snagSheetView.tsx"),
);
const ProjectDocumentSheetViewLazy = lazy(
    () => import("@propertyManagementModule/clients/panel/private/projectDocuments/center/sheetView/projectDocumentSheetView.tsx"),
);
const PermitSheetViewLazy = lazy(
    () => import("@propertyManagementModule/clients/panel/private/permits/center/sheetView/permitSheetView.tsx"),
);
const EdificeSheetViewLazy = lazy(
    () => import("@propertyManagementModule/clients/panel/private/edifices/center/sheetView/edificeSheetView.tsx"),
);
const FloorSheetViewLazy = lazy(
    () => import("@propertyManagementModule/clients/panel/private/floors/center/sheetView/floorSheetView.tsx"),
);
const UnitSheetViewLazy = lazy(
    () => import("@propertyManagementModule/clients/panel/private/units/center/sheetView/unitSheetView.tsx"),
);
const SaleSheetViewLazy = lazy(
    () => import("@propertyManagementModule/clients/panel/private/sales/center/sheetView/saleSheetView.tsx"),
);
const PaymentPlanSheetViewLazy = lazy(
    () => import("@propertyManagementModule/clients/panel/private/sales/center/sheetView/paymentPlanSheetView.tsx"),
);
const ReservationSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/reservations/center/sheetView/reservationSheetView.tsx"
        ),
);
const ModificationRequestSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/modificationRequests/center/sheetView/modificationRequestSheetView.tsx"
        ),
);
const InspectionSheetViewLazy = lazy(
    () =>
        import("@propertyManagementModule/clients/panel/private/inspections/center/sheetView/inspectionSheetView.tsx"),
);
const UnitCostSheetViewLazy = lazy(
    () => import("@propertyManagementModule/clients/panel/private/unitCosts/center/sheetView/unitCostSheetView.tsx"),
);
const UnitTypeSheetViewLazy = lazy(
    () => import("@propertyManagementModule/clients/panel/private/unitTypes/center/sheetView/unitTypeSheetView.tsx"),
);
const UnitTypeCategorySheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/unitTypeCategories/center/sheetView/unitTypeCategorySheetView.tsx"
        ),
);
const StoryTypeSheetViewLazy = lazy(
    () => import("@propertyManagementModule/clients/panel/private/storyTypes/center/sheetView/storyTypeSheetView.tsx"),
);
const ConstructorSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/constructors/center/sheetView/constructorSheetView.tsx"
        ),
);
const CommissionSheetViewLazy = lazy(
    () =>
        import("@propertyManagementModule/clients/panel/private/commissions/center/sheetView/commissionSheetView.tsx"),
);
const MilestoneSheetViewLazy = lazy(
    () => import("@propertyManagementModule/clients/panel/private/milestones/center/sheetView/milestoneSheetView.tsx"),
);
const ScheduleTaskSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/scheduleTasks/center/sheetView/scheduleTaskSheetView.tsx"
        ),
);

const BudgetSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/budgets/center/sheetView/budgetSheetView.tsx"
        ),
);
const BoqItemSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/boqItems/center/sheetView/boqItemSheetView.tsx"
        ),
);
const CostCommitmentSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/costCommitments/center/sheetView/costCommitmentSheetView.tsx"
        ),
);
const WorkPackageSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/workPackages/center/sheetView/workPackageSheetView.tsx"
        ),
);
const ConstructionContractSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/constructionContracts/center/sheetView/constructionContractSheetView.tsx"
        ),
);
const ProgressClaimSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/progressClaims/center/sheetView/progressClaimSheetView.tsx"
        ),
);
const RfiSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/rfis/center/sheetView/rfiSheetView.tsx"
        ),
);
const SubmittalSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/submittals/center/sheetView/submittalSheetView.tsx"
        ),
);
const VariationOrderSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/variationOrders/center/sheetView/variationOrderSheetView.tsx"
        ),
);
const LandParcelSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/landParcels/center/sheetView/landParcelSheetView.tsx"
        ),
);
const FeasibilityStudySheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/feasibilityStudies/center/sheetView/feasibilityStudySheetView.tsx"
        ),
);
const SiteDiarySheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/siteDiaries/center/sheetView/siteDiarySheetView.tsx"
        ),
);
const SafetyIncidentSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/safetyIncidents/center/sheetView/safetyIncidentSheetView.tsx"
        ),
);
const WarrantySheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/warranties/center/sheetView/warrantySheetView.tsx"
        ),
);
const HandoverPackageSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/handoverPackages/center/sheetView/handoverPackageSheetView.tsx"
        ),
);
const CommissioningRecordSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/commissioningRecords/center/sheetView/commissioningRecordSheetView.tsx"
        ),
);
const DesignStageSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/designStages/center/sheetView/designStageSheetView.tsx"
        ),
);
const InspectionChecklistTemplateSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/inspectionChecklistTemplates/center/sheetView/inspectionChecklistTemplateSheetView.tsx"
        ),
);
const ConsultantAppointmentSheetViewLazy = lazy(
    () =>
        import(
            "@propertyManagementModule/clients/panel/private/consultantAppointments/center/sheetView/consultantAppointmentSheetView.tsx"
        ),
);

function sheetFieldVisible(
    node: {permissions?: {read?: string}},
    ctx: {access?: Record<string, any>},
): boolean {
    return !(node.permissions?.read && !hasAccessPath(ctx.access, node.permissions.read));
}

const propertyManagementWidgetContribution: WidgetContribution = {
    id: "propertyManagement",
    order: 20,
    widgets: {
        "#FormFloorPolygon": FormFloorPolygon,
        "#FormEdificePolygon": FormEdificePolygon,
        "#FormUnitPolygon": FormUnitPolygon,
        "#SheetPriceHistoryChart": SheetPriceHistoryChart,
        "#FormExpenditureItemsField": FormExpenditureItemsField,
        "#SheetModificationLineItems": SheetLineItems,
        "#PaymentPlanInstallmentsField": PaymentPlanInstallmentsField,
        "#UnitCard": UnitCard,
        "#InspectionCard": InspectionCard,
        "#UnitCostCard": UnitCostCard,
        "#ModificationRequestCard": ModificationRequestCard,
        "#EdificeCard": EdificeCard,
        "#SaleCard": SaleCard,
        "#ReservationCard": ReservationCard,
        "#PaymentPlanCard": PaymentPlanCard,
        "#ProjectSheetView": ProjectSheetViewLazy,
        "#ConstructionUpdateSheetView": ConstructionUpdateSheetViewLazy,
        "#StorySheetView": StorySheetViewLazy,
        "#SnagSheetView": SnagSheetViewLazy,
        "#ProjectDocumentSheetView": ProjectDocumentSheetViewLazy,
        "#PermitSheetView": PermitSheetViewLazy,
        "#EdificeSheetView": EdificeSheetViewLazy,
        "#FloorSheetView": FloorSheetViewLazy,
        "#UnitSheetView": UnitSheetViewLazy,
        "#SaleSheetView": SaleSheetViewLazy,
        "#PaymentPlanSheetView": PaymentPlanSheetViewLazy,
        "#ReservationSheetView": ReservationSheetViewLazy,
        "#ModificationRequestSheetView": ModificationRequestSheetViewLazy,
        "#InspectionSheetView": InspectionSheetViewLazy,
        "#UnitCostSheetView": UnitCostSheetViewLazy,
        "#UnitTypeSheetView": UnitTypeSheetViewLazy,
        "#UnitTypeCategorySheetView": UnitTypeCategorySheetViewLazy,
        "#StoryTypeSheetView": StoryTypeSheetViewLazy,
        "#ConstructorSheetView": ConstructorSheetViewLazy,
        "#CommissionSheetView": CommissionSheetViewLazy,
        "#MilestoneSheetView": MilestoneSheetViewLazy,
        "#ScheduleTaskSheetView": ScheduleTaskSheetViewLazy,
        "#BudgetSheetView": BudgetSheetViewLazy,
        "#BoqItemSheetView": BoqItemSheetViewLazy,
        "#CostCommitmentSheetView": CostCommitmentSheetViewLazy,
        "#WorkPackageSheetView": WorkPackageSheetViewLazy,
        "#ConstructionContractSheetView": ConstructionContractSheetViewLazy,
        "#ProgressClaimSheetView": ProgressClaimSheetViewLazy,
        "#RfiSheetView": RfiSheetViewLazy,
        "#SubmittalSheetView": SubmittalSheetViewLazy,
        "#VariationOrderSheetView": VariationOrderSheetViewLazy,
        "#LandParcelSheetView": LandParcelSheetViewLazy,
        "#FeasibilityStudySheetView": FeasibilityStudySheetViewLazy,
        "#SiteDiarySheetView": SiteDiarySheetViewLazy,
        "#SafetyIncidentSheetView": SafetyIncidentSheetViewLazy,
        "#WarrantySheetView": WarrantySheetViewLazy,
        "#HandoverPackageSheetView": HandoverPackageSheetViewLazy,
        "#CommissioningRecordSheetView": CommissioningRecordSheetViewLazy,
        "#DesignStageSheetView": DesignStageSheetViewLazy,
        "#InspectionChecklistTemplateSheetView": InspectionChecklistTemplateSheetViewLazy,
        "#ConsultantAppointmentSheetView": ConsultantAppointmentSheetViewLazy,
    },
    referencesDefaultItemProps: {
        "#InspectionCard": "inspection",
        "#UnitCostCard": "unitCost",
        "#ModificationRequestCard": "request",
        "#EdificeCard": "edifice",
        "#SaleCard": "sale",
        "#ReservationCard": "reservation",
        "#PaymentPlanCard": "paymentPlan",
        "#UnitCard": "unit",
    },
    sheetFieldRenderers: {
        "#UnitSaleCard": ({node, binding, ctx, index}) => {
            const {data} = ctx;
            const wp = binding.widgetProps ?? {};
            if (!sheetFieldVisible(node, ctx) || !data) return null;
            const raw = resolvePath(data, binding.name);
            const normalized = normalizeObjectIdRef<Sale>(raw);
            if (!normalized) return null;
            const unitId = typeof data._id === "string" ? data._id : "";
            const unitName =
                (typeof data.name === "string" && data.name) ||
                (typeof data.unitNumber === "string" && data.unitNumber) ||
                unitId;
            return createElement(SaleCard, {
                ...wp,
                key: index,
                sale: normalized.stub,
                fetchId: normalized.fetchId,
                unitId,
                unitName,
            });
        },
        "#UnitReservationCard": ({node, binding, ctx, index}) => {
            const {data} = ctx;
            const wp = binding.widgetProps ?? {};
            if (!sheetFieldVisible(node, ctx) || !data) return null;
            const raw = resolvePath(data, binding.name);
            const normalized = normalizeObjectIdRef<Reservation>(raw);
            if (!normalized) return null;
            return createElement(ReservationCard, {
                ...wp,
                key: index,
                reservation: normalized.stub,
                fetchId: normalized.fetchId,
            });
        },
        "#UnitPaymentPlanCard": ({node, binding, ctx, index}) => {
            const {data} = ctx;
            const wp = binding.widgetProps ?? {};
            if (!sheetFieldVisible(node, ctx) || !data) return null;
            const raw = resolvePath(data, binding.name);
            const normalized = normalizeObjectIdRef<PaymentPlan>(raw);
            if (!normalized) return null;
            return createElement(PaymentPlanCard, {
                ...wp,
                key: index,
                paymentPlan: normalized.stub,
                fetchId: normalized.fetchId,
            });
        },
        "#SheetModificationLineItems": ({node, binding, ctx, index, Component}) => {
            if (!sheetFieldVisible(node, ctx)) return null;
            return createSheetLineItems(
                ctx.data,
                binding,
                ctx,
                binding.widgetProps ?? {},
                Component ?? SheetLineItems,
                index,
            );
        },
        "#SheetPriceHistoryChart": ({node, binding, ctx, index, Component}) => {
            const {data} = ctx;
            const wp = binding.widgetProps ?? {};
            if (!sheetFieldVisible(node, ctx) || !data) return null;
            if (ctx.access && !hasAccessPath(ctx.access, binding.name)) return null;
            const raw = resolvePath(data, binding.name);
            const entries = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
            const Chart = Component ?? SheetPriceHistoryChart;
            if (entries.length === 0) return createElement(ValueNotSet, {key: index});
            const normalized = entries.map((row) => ({
                price: typeof row.price === "number" ? row.price : Number(row.price) || 0,
                currency:
                    row.currency != null && typeof row.currency === "object"
                        ? (row.currency as SheetPriceHistoryChartProps["entries"][number]["currency"])
                        : undefined,
                changedAt: typeof row.changedAt === "string" ? row.changedAt : undefined,
                changedBy:
                    row.changedBy != null && typeof row.changedBy === "object"
                        ? (row.changedBy as SheetPriceHistoryChartProps["entries"][number]["changedBy"])
                        : undefined,
                reason: typeof row.reason === "string" ? row.reason : undefined,
            }));
            return createElement(Chart as ComponentType<any>, {
                key: index,
                entries: normalized,
                resolveLanguageKey: ctx.resolveLanguageKey,
                className: typeof wp.className === "string" ? wp.className : undefined,
            });
        },
    },
    auditSinglePostHints: {
        "#ProjectSheetView": {url: "/api/realEstate/project/single", labelFields: ["name"]},
        "#EdificeSheetView": {url: "/api/realEstate/edifice/single", labelFields: ["name"]},
        "#FloorSheetView": {url: "/api/realEstate/floor/single", labelFields: ["name"]},
        "#UnitSheetView": {url: "/api/realEstate/unit/single", labelFields: ["unitNumber", "name"]},
        "#UnitTypeSheetView": {url: "/api/realEstate/unitType/single", labelFields: ["name"]},
        "#UnitTypeCategorySheetView": {url: "/api/realEstate/unitTypeCategory/single", labelFields: ["name"]},
        "#StoryTypeSheetView": {url: "/api/realEstate/storyType/single", labelFields: ["name"]},
        "#InspectionSheetView": {url: "/api/realEstate/unit/inspection/single", labelFields: ["name", "title"]},
        "#UnitCostSheetView": {url: "/api/realEstate/unit/cost/single", labelFields: ["name", "title"]},
        "#ModificationRequestSheetView": {
            url: "/api/realEstate/unit/modificationRequest/single",
            labelFields: ["name", "title"],
        },
        "#SaleSheetView": {url: "/api/realEstate/unit/sale/single", labelFields: ["name", "title"]},
        "#ReservationSheetView": {url: "/api/realEstate/unit/reservation/single", labelFields: ["name", "title"]},
        "#PaymentPlanSheetView": {
            url: "/api/realEstate/unit/sale/paymentPlan/single",
            labelFields: ["name", "title"],
        },
        "#ConstructorSheetView": {url: "/api/realEstate/constructor/single", labelFields: ["name"]},
        "#CommissionSheetView": {url: "/api/realEstate/commission/single", labelFields: ["name", "title"]},
        "#ConstructionUpdateSheetView": {
            url: "/api/realEstate/constructionUpdate/single",
            labelFields: ["title", "name"],
        },
        "#StorySheetView": {
            url: "/api/realEstate/story/single",
            labelFields: ["title", "name"],
        },
        "#SnagSheetView": {url: "/api/realEstate/snag/single", labelFields: ["title", "name"]},
        "#ProjectDocumentSheetView": {url: "/api/realEstate/projectDocument/single", labelFields: ["title", "name"]},
        "#PermitSheetView": {url: "/api/realEstate/permit/single", labelFields: ["title", "name"]},
        "#MilestoneSheetView": {url: "/api/realEstate/milestone/single", labelFields: ["title", "name"]},
        "#ScheduleTaskSheetView": {url: "/api/realEstate/scheduleTask/single", labelFields: ["title", "name"]},
        "#BudgetSheetView": {url: "/api/realEstate/budget/single", labelFields: ["title", "name"]},
        "#BoqItemSheetView": {url: "/api/realEstate/boqItem/single", labelFields: ["title", "name"]},
        "#CostCommitmentSheetView": {url: "/api/realEstate/costCommitment/single", labelFields: ["title", "name"]},
        "#WorkPackageSheetView": {url: "/api/realEstate/workPackage/single", labelFields: ["title", "name"]},
        "#ConstructionContractSheetView": {url: "/api/realEstate/constructionContract/single", labelFields: ["title", "name"]},
        "#ProgressClaimSheetView": {url: "/api/realEstate/progressClaim/single", labelFields: ["title", "name"]},
        "#RfiSheetView": {url: "/api/realEstate/rfi/single", labelFields: ["title", "name"]},
        "#SubmittalSheetView": {url: "/api/realEstate/submittal/single", labelFields: ["title", "name"]},
        "#VariationOrderSheetView": {url: "/api/realEstate/variationOrder/single", labelFields: ["title", "name"]},
        "#LandParcelSheetView": {url: "/api/realEstate/landParcel/single", labelFields: ["title", "name"]},
        "#FeasibilityStudySheetView": {url: "/api/realEstate/feasibilityStudy/single", labelFields: ["title", "name"]},
        "#SiteDiarySheetView": {url: "/api/realEstate/siteDiary/single", labelFields: ["title", "name"]},
        "#SafetyIncidentSheetView": {url: "/api/realEstate/safetyIncident/single", labelFields: ["title", "name"]},
        "#WarrantySheetView": {url: "/api/realEstate/warranty/single", labelFields: ["title", "name"]},
        "#HandoverPackageSheetView": {url: "/api/realEstate/handoverPackage/single", labelFields: ["title", "name"]},
        "#CommissioningRecordSheetView": {url: "/api/realEstate/commissioningRecord/single", labelFields: ["title", "name"]},
        "#DesignStageSheetView": {url: "/api/realEstate/designStage/single", labelFields: ["title", "name"]},
        "#InspectionChecklistTemplateSheetView": {url: "/api/realEstate/inspectionChecklistTemplate/single", labelFields: ["title", "name"]},
        "#ConsultantAppointmentSheetView": {url: "/api/realEstate/consultantAppointment/single", labelFields: ["title", "name"]},
        "#UnitSaleCard": {url: "/api/realEstate/unit/sale/single", labelFields: ["name", "title"]},
        "#UnitReservationCard": {url: "/api/realEstate/unit/reservation/single", labelFields: ["name", "title"]},
        "#UnitPaymentPlanCard": {
            url: "/api/realEstate/unit/sale/paymentPlan/single",
            labelFields: ["name", "title"],
        },
    },
};

export default propertyManagementWidgetContribution;
