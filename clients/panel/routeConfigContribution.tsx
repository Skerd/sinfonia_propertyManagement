import CreateProject from "@propertyManagementModule/clients/panel/private/projects/createProject.tsx";
import AllProjects from "@propertyManagementModule/clients/panel/private/projects";
import EditProject from "@propertyManagementModule/clients/panel/private/projects/editProject.tsx";
import CreateEdifice from "@propertyManagementModule/clients/panel/private/edifices/createEdifice.tsx";
import EditEdifice from "@propertyManagementModule/clients/panel/private/edifices/editEdifice.tsx";
import AllEdifices from "@propertyManagementModule/clients/panel/private/edifices";
import CreateFloor from "@propertyManagementModule/clients/panel/private/floors/createFloor.tsx";
import EditFloor from "@propertyManagementModule/clients/panel/private/floors/editFloor.tsx";
import AllFloors from "@propertyManagementModule/clients/panel/private/floors";
import CreateUnit from "@propertyManagementModule/clients/panel/private/units/createUnit.tsx";
import EditUnit from "@propertyManagementModule/clients/panel/private/units/editUnit.tsx";
import AllUnits from "@propertyManagementModule/clients/panel/private/units";
import UnitAvailabilityCalendar from "@propertyManagementModule/clients/panel/private/units/availabilityCalendar.tsx";
import CreateInspection from "@propertyManagementModule/clients/panel/private/inspections/createInspection.tsx";
import EditInspection from "@propertyManagementModule/clients/panel/private/inspections/editInspection.tsx";
import AllInspections from "@propertyManagementModule/clients/panel/private/inspections";
import CreateUnitCost from "@propertyManagementModule/clients/panel/private/unitCosts/createUnitCost.tsx";
import EditUnitCost from "@propertyManagementModule/clients/panel/private/unitCosts/editUnitCost.tsx";
import AllUnitCosts from "@propertyManagementModule/clients/panel/private/unitCosts";
import CreateModificationRequest from "@propertyManagementModule/clients/panel/private/modificationRequests/createModificationRequest.tsx";
import CreateUnitType from "@propertyManagementModule/clients/panel/private/unitTypes/createUnitType.tsx";
import EditUnitType from "@propertyManagementModule/clients/panel/private/unitTypes/editUnitType.tsx";
import AllUnitTypes from "@propertyManagementModule/clients/panel/private/unitTypes";
import CreateStoryType from "@propertyManagementModule/clients/panel/private/storyTypes/createStoryType.tsx";
import EditStoryType from "@propertyManagementModule/clients/panel/private/storyTypes/editStoryType.tsx";
import AllStoryTypes from "@propertyManagementModule/clients/panel/private/storyTypes";
import CreateUnitTypeCategory from "@propertyManagementModule/clients/panel/private/unitTypeCategories/createUnitTypeCategory.tsx";
import EditUnitTypeCategory from "@propertyManagementModule/clients/panel/private/unitTypeCategories/editUnitTypeCategory.tsx";
import AllUnitTypeCategories from "@propertyManagementModule/clients/panel/private/unitTypeCategories";
import CreateConstructor from "@propertyManagementModule/clients/panel/private/constructors/createConstructor.tsx";
import EditConstructor from "@propertyManagementModule/clients/panel/private/constructors/editConstructor.tsx";
import AllConstructors from "@propertyManagementModule/clients/panel/private/constructors";
import PropertyManagementConfigGate from "@propertyManagementModule/clients/panel/private/propertyManagementConfig";
import AllModificationRequests from "@propertyManagementModule/clients/panel/private/modificationRequests";
import CreateReservation from "@propertyManagementModule/clients/panel/private/reservations/createReservation.tsx";
import AllReservations from "@propertyManagementModule/clients/panel/private/reservations";
import CreateSaleChoice from "@propertyManagementModule/clients/panel/private/sales/createSaleChoice.tsx";
import CreateCashSale from "@propertyManagementModule/clients/panel/private/sales/createCashSale.tsx";
import CreatePaymentPlanSale from "@propertyManagementModule/clients/panel/private/sales/createPaymentPlanSale.tsx";
import AllSales from "@propertyManagementModule/clients/panel/private/sales";
import EditSale from "@propertyManagementModule/clients/panel/private/sales/editSale.tsx";
import AllCommissions from "@propertyManagementModule/clients/panel/private/commissions";
import AgentReport from "@propertyManagementModule/clients/panel/private/agentReport";
import ContractsHub from "@propertyManagementModule/clients/panel/private/contractsHub";
import AllLeads from "@propertyManagementModule/clients/panel/private/leads";
import CreateLead from "@propertyManagementModule/clients/panel/private/leads/createLead.tsx";
import EditLead from "@propertyManagementModule/clients/panel/private/leads/editLead.tsx";
import RentalsHub from "@propertyManagementModule/clients/panel/private/rentalsHub";
import AllLeases from "@propertyManagementModule/clients/panel/private/leases";
import CreateLease from "@propertyManagementModule/clients/panel/private/leases/createLease.tsx";
import EditLease from "@propertyManagementModule/clients/panel/private/leases/editLease.tsx";
import AllRentalPayments from "@propertyManagementModule/clients/panel/private/rentalPayments";
import CreateRentalPayment from "@propertyManagementModule/clients/panel/private/rentalPayments/createRentalPayment.tsx";
import EditRentalPayment from "@propertyManagementModule/clients/panel/private/rentalPayments/editRentalPayment.tsx";
import RealEstateDashboard from "@propertyManagementModule/clients/panel/private/dashboard";
import EditModificationRequest from "@propertyManagementModule/clients/panel/private/modificationRequests/editModificationRequest.tsx";
import Dashboard from "@propertyManagementModule/clients/panel/private/overview";
import RoiCalculator from "@propertyManagementModule/clients/panel/private/overview/roi/roiCalculator.tsx";
import AllConstructionUpdates from "@propertyManagementModule/clients/panel/private/constructionUpdates";
import CreateConstructionUpdate from "@propertyManagementModule/clients/panel/private/constructionUpdates/createConstructionUpdate.tsx";
import EditConstructionUpdate from "@propertyManagementModule/clients/panel/private/constructionUpdates/editConstructionUpdate.tsx";
import AllStories from "@propertyManagementModule/clients/panel/private/stories";
import CreateStory from "@propertyManagementModule/clients/panel/private/stories/createStory.tsx";
import EditStory from "@propertyManagementModule/clients/panel/private/stories/editStory.tsx";
import AllSnags from "@propertyManagementModule/clients/panel/private/snags";
import CreateSnag from "@propertyManagementModule/clients/panel/private/snags/createSnag.tsx";
import EditSnag from "@propertyManagementModule/clients/panel/private/snags/editSnag.tsx";
import AllProjectDocuments from "@propertyManagementModule/clients/panel/private/projectDocuments";
import CreateProjectDocument from "@propertyManagementModule/clients/panel/private/projectDocuments/createProjectDocument.tsx";
import EditProjectDocument from "@propertyManagementModule/clients/panel/private/projectDocuments/editProjectDocument.tsx";
import AllPermits from "@propertyManagementModule/clients/panel/private/permits";
import CreatePermit from "@propertyManagementModule/clients/panel/private/permits/createPermit.tsx";
import EditPermit from "@propertyManagementModule/clients/panel/private/permits/editPermit.tsx";
import AllBudgets from "@propertyManagementModule/clients/panel/private/budgets";
import CreateBudget from "@propertyManagementModule/clients/panel/private/budgets/createBudget.tsx";
import EditBudget from "@propertyManagementModule/clients/panel/private/budgets/editBudget.tsx";
import EstimateComparison from "@propertyManagementModule/clients/panel/private/estimateComparison/estimateComparison.tsx";
import BidComparison from "@propertyManagementModule/clients/panel/private/bidComparison/bidComparison.tsx";
import CostControl from "@propertyManagementModule/clients/panel/private/costControl/costControl.tsx";
import Cockpit from "@propertyManagementModule/clients/panel/private/cockpit/cockpit.tsx";
import AllSpecifications from "@propertyManagementModule/clients/panel/private/specifications";
import CreateSpecification from "@propertyManagementModule/clients/panel/private/specifications/createSpecification.tsx";
import EditSpecification from "@propertyManagementModule/clients/panel/private/specifications/editSpecification.tsx";
import AllSpecificationItems from "@propertyManagementModule/clients/panel/private/specificationItems";
import CreateSpecificationItem from "@propertyManagementModule/clients/panel/private/specificationItems/createSpecificationItem.tsx";
import EditSpecificationItem from "@propertyManagementModule/clients/panel/private/specificationItems/editSpecificationItem.tsx";
import AllTenders from "@propertyManagementModule/clients/panel/private/tenders";
import CreateTender from "@propertyManagementModule/clients/panel/private/tenders/createTender.tsx";
import EditTender from "@propertyManagementModule/clients/panel/private/tenders/editTender.tsx";
import AllTenderInvitations from "@propertyManagementModule/clients/panel/private/tenderInvitations";
import CreateTenderInvitation from "@propertyManagementModule/clients/panel/private/tenderInvitations/createTenderInvitation.tsx";
import EditTenderInvitation from "@propertyManagementModule/clients/panel/private/tenderInvitations/editTenderInvitation.tsx";
import AllBids from "@propertyManagementModule/clients/panel/private/bids";
import CreateBid from "@propertyManagementModule/clients/panel/private/bids/createBid.tsx";
import EditBid from "@propertyManagementModule/clients/panel/private/bids/editBid.tsx";
import AllBidLines from "@propertyManagementModule/clients/panel/private/bidLines";
import CreateBidLine from "@propertyManagementModule/clients/panel/private/bidLines/createBidLine.tsx";
import EditBidLine from "@propertyManagementModule/clients/panel/private/bidLines/editBidLine.tsx";
import AllApprovalWorkflows from "@propertyManagementModule/clients/panel/private/approvalWorkflows";
import CreateApprovalWorkflow from "@propertyManagementModule/clients/panel/private/approvalWorkflows/createApprovalWorkflow.tsx";
import EditApprovalWorkflow from "@propertyManagementModule/clients/panel/private/approvalWorkflows/editApprovalWorkflow.tsx";
import AllApprovalRequests from "@propertyManagementModule/clients/panel/private/approvalRequests";
import CreateApprovalRequest from "@propertyManagementModule/clients/panel/private/approvalRequests/createApprovalRequest.tsx";
import EditApprovalRequest from "@propertyManagementModule/clients/panel/private/approvalRequests/editApprovalRequest.tsx";
import AllContractorInvoices from "@propertyManagementModule/clients/panel/private/contractorInvoices";
import CreateContractorInvoice from "@propertyManagementModule/clients/panel/private/contractorInvoices/createContractorInvoice.tsx";
import EditContractorInvoice from "@propertyManagementModule/clients/panel/private/contractorInvoices/editContractorInvoice.tsx";
import AllIncomingInvoices from "@propertyManagementModule/clients/panel/private/incomingInvoices";
import CreateIncomingInvoice from "@propertyManagementModule/clients/panel/private/incomingInvoices/createIncomingInvoice.tsx";
import EditIncomingInvoice from "@propertyManagementModule/clients/panel/private/incomingInvoices/editIncomingInvoice.tsx";
import AllLiquidityPlans from "@propertyManagementModule/clients/panel/private/liquidityPlans";
import CreateLiquidityPlan from "@propertyManagementModule/clients/panel/private/liquidityPlans/createLiquidityPlan.tsx";
import EditLiquidityPlan from "@propertyManagementModule/clients/panel/private/liquidityPlans/editLiquidityPlan.tsx";
import AllLiquidityLines from "@propertyManagementModule/clients/panel/private/liquidityLines";
import CreateLiquidityLine from "@propertyManagementModule/clients/panel/private/liquidityLines/createLiquidityLine.tsx";
import EditLiquidityLine from "@propertyManagementModule/clients/panel/private/liquidityLines/editLiquidityLine.tsx";
import AllFeeCalculations from "@propertyManagementModule/clients/panel/private/feeCalculations";
import CreateFeeCalculation from "@propertyManagementModule/clients/panel/private/feeCalculations/createFeeCalculation.tsx";
import EditFeeCalculation from "@propertyManagementModule/clients/panel/private/feeCalculations/editFeeCalculation.tsx";
import AllPlanMarkups from "@propertyManagementModule/clients/panel/private/planMarkups";
import CreatePlanMarkup from "@propertyManagementModule/clients/panel/private/planMarkups/createPlanMarkup.tsx";
import EditPlanMarkup from "@propertyManagementModule/clients/panel/private/planMarkups/editPlanMarkup.tsx";
import AllAssets from "@propertyManagementModule/clients/panel/private/assets";
import CreateAsset from "@propertyManagementModule/clients/panel/private/assets/createAsset.tsx";
import EditAsset from "@propertyManagementModule/clients/panel/private/assets/editAsset.tsx";
import AllMaintenancePlans from "@propertyManagementModule/clients/panel/private/maintenancePlans";
import CreateMaintenancePlan from "@propertyManagementModule/clients/panel/private/maintenancePlans/createMaintenancePlan.tsx";
import EditMaintenancePlan from "@propertyManagementModule/clients/panel/private/maintenancePlans/editMaintenancePlan.tsx";
import AllMaintenanceWorkOrders from "@propertyManagementModule/clients/panel/private/maintenanceWorkOrders";
import CreateMaintenanceWorkOrder from "@propertyManagementModule/clients/panel/private/maintenanceWorkOrders/createMaintenanceWorkOrder.tsx";
import EditMaintenanceWorkOrder from "@propertyManagementModule/clients/panel/private/maintenanceWorkOrders/editMaintenanceWorkOrder.tsx";
import AllBimModels from "@propertyManagementModule/clients/panel/private/bimModels";
import CreateBimModel from "@propertyManagementModule/clients/panel/private/bimModels/createBimModel.tsx";
import EditBimModel from "@propertyManagementModule/clients/panel/private/bimModels/editBimModel.tsx";
import AllBimQuantities from "@propertyManagementModule/clients/panel/private/bimQuantities";
import CreateBimQuantity from "@propertyManagementModule/clients/panel/private/bimQuantities/createBimQuantity.tsx";
import EditBimQuantity from "@propertyManagementModule/clients/panel/private/bimQuantities/editBimQuantity.tsx";
import AllCostClassifications from "@propertyManagementModule/clients/panel/private/costClassifications";
import CreateCostClassification from "@propertyManagementModule/clients/panel/private/costClassifications/createCostClassification.tsx";
import EditCostClassification from "@propertyManagementModule/clients/panel/private/costClassifications/editCostClassification.tsx";
import AllBoqItems from "@propertyManagementModule/clients/panel/private/boqItems";
import CreateBoqItem from "@propertyManagementModule/clients/panel/private/boqItems/createBoqItem.tsx";
import EditBoqItem from "@propertyManagementModule/clients/panel/private/boqItems/editBoqItem.tsx";
import AllCostCommitments from "@propertyManagementModule/clients/panel/private/costCommitments";
import CreateCostCommitment from "@propertyManagementModule/clients/panel/private/costCommitments/createCostCommitment.tsx";
import EditCostCommitment from "@propertyManagementModule/clients/panel/private/costCommitments/editCostCommitment.tsx";
import AllWorkPackages from "@propertyManagementModule/clients/panel/private/workPackages";
import CreateWorkPackage from "@propertyManagementModule/clients/panel/private/workPackages/createWorkPackage.tsx";
import EditWorkPackage from "@propertyManagementModule/clients/panel/private/workPackages/editWorkPackage.tsx";
import AllConstructionContracts from "@propertyManagementModule/clients/panel/private/constructionContracts";
import CreateConstructionContract from "@propertyManagementModule/clients/panel/private/constructionContracts/createConstructionContract.tsx";
import EditConstructionContract from "@propertyManagementModule/clients/panel/private/constructionContracts/editConstructionContract.tsx";
import AllProgressClaims from "@propertyManagementModule/clients/panel/private/progressClaims";
import CreateProgressClaim from "@propertyManagementModule/clients/panel/private/progressClaims/createProgressClaim.tsx";
import EditProgressClaim from "@propertyManagementModule/clients/panel/private/progressClaims/editProgressClaim.tsx";
import AllRfis from "@propertyManagementModule/clients/panel/private/rfis";
import CreateRfi from "@propertyManagementModule/clients/panel/private/rfis/createRfi.tsx";
import EditRfi from "@propertyManagementModule/clients/panel/private/rfis/editRfi.tsx";
import AllSubmittals from "@propertyManagementModule/clients/panel/private/submittals";
import CreateSubmittal from "@propertyManagementModule/clients/panel/private/submittals/createSubmittal.tsx";
import EditSubmittal from "@propertyManagementModule/clients/panel/private/submittals/editSubmittal.tsx";
import AllVariationOrders from "@propertyManagementModule/clients/panel/private/variationOrders";
import CreateVariationOrder from "@propertyManagementModule/clients/panel/private/variationOrders/createVariationOrder.tsx";
import EditVariationOrder from "@propertyManagementModule/clients/panel/private/variationOrders/editVariationOrder.tsx";
import AllLandParcels from "@propertyManagementModule/clients/panel/private/landParcels";
import CreateLandParcel from "@propertyManagementModule/clients/panel/private/landParcels/createLandParcel.tsx";
import EditLandParcel from "@propertyManagementModule/clients/panel/private/landParcels/editLandParcel.tsx";
import AllFeasibilityStudys from "@propertyManagementModule/clients/panel/private/feasibilityStudies";
import CreateFeasibilityStudy from "@propertyManagementModule/clients/panel/private/feasibilityStudies/createFeasibilityStudy.tsx";
import EditFeasibilityStudy from "@propertyManagementModule/clients/panel/private/feasibilityStudies/editFeasibilityStudy.tsx";
import AllSiteDiarys from "@propertyManagementModule/clients/panel/private/siteDiaries";
import CreateSiteDiary from "@propertyManagementModule/clients/panel/private/siteDiaries/createSiteDiary.tsx";
import EditSiteDiary from "@propertyManagementModule/clients/panel/private/siteDiaries/editSiteDiary.tsx";
import AllSafetyIncidents from "@propertyManagementModule/clients/panel/private/safetyIncidents";
import CreateSafetyIncident from "@propertyManagementModule/clients/panel/private/safetyIncidents/createSafetyIncident.tsx";
import EditSafetyIncident from "@propertyManagementModule/clients/panel/private/safetyIncidents/editSafetyIncident.tsx";
import AllWarrantys from "@propertyManagementModule/clients/panel/private/warranties";
import CreateWarranty from "@propertyManagementModule/clients/panel/private/warranties/createWarranty.tsx";
import EditWarranty from "@propertyManagementModule/clients/panel/private/warranties/editWarranty.tsx";
import AllHandoverPackages from "@propertyManagementModule/clients/panel/private/handoverPackages";
import CreateHandoverPackage from "@propertyManagementModule/clients/panel/private/handoverPackages/createHandoverPackage.tsx";
import EditHandoverPackage from "@propertyManagementModule/clients/panel/private/handoverPackages/editHandoverPackage.tsx";
import AllCommissioningRecords from "@propertyManagementModule/clients/panel/private/commissioningRecords";
import CreateCommissioningRecord from "@propertyManagementModule/clients/panel/private/commissioningRecords/createCommissioningRecord.tsx";
import EditCommissioningRecord from "@propertyManagementModule/clients/panel/private/commissioningRecords/editCommissioningRecord.tsx";
import AllDesignStages from "@propertyManagementModule/clients/panel/private/designStages";
import CreateDesignStage from "@propertyManagementModule/clients/panel/private/designStages/createDesignStage.tsx";
import EditDesignStage from "@propertyManagementModule/clients/panel/private/designStages/editDesignStage.tsx";
import AllInspectionChecklistTemplates from "@propertyManagementModule/clients/panel/private/inspectionChecklistTemplates";
import CreateInspectionChecklistTemplate from "@propertyManagementModule/clients/panel/private/inspectionChecklistTemplates/createInspectionChecklistTemplate.tsx";
import EditInspectionChecklistTemplate from "@propertyManagementModule/clients/panel/private/inspectionChecklistTemplates/editInspectionChecklistTemplate.tsx";
import AllConsultantAppointments from "@propertyManagementModule/clients/panel/private/consultantAppointments";
import CreateConsultantAppointment from "@propertyManagementModule/clients/panel/private/consultantAppointments/createConsultantAppointment.tsx";
import EditConsultantAppointment from "@propertyManagementModule/clients/panel/private/consultantAppointments/editConsultantAppointment.tsx";
import AllMilestones from "@propertyManagementModule/clients/panel/private/milestones";
import CreateMilestone from "@propertyManagementModule/clients/panel/private/milestones/createMilestone.tsx";
import EditMilestone from "@propertyManagementModule/clients/panel/private/milestones/editMilestone.tsx";
import AllScheduleTasks from "@propertyManagementModule/clients/panel/private/scheduleTasks";
import CreateScheduleTask from "@propertyManagementModule/clients/panel/private/scheduleTasks/createScheduleTask.tsx";
import EditScheduleTask from "@propertyManagementModule/clients/panel/private/scheduleTasks/editScheduleTask.tsx";
import ErpExport from "@propertyManagementModule/clients/panel/private/erpExport/erpExport.tsx";
import GroupDashboard from "@propertyManagementModule/clients/panel/private/groupDashboard/groupDashboard.tsx";
import PropertyManagementSystemMap from "@propertyManagementModule/clients/panel/private/systemMap";
import type {RouteConfigArgs, RouteConfigContribution} from "@coreModule/clients/panel/moduleContributions/routeConfigContribution.types.ts";

function safeDecode(value: string | null): string | undefined {
    if (value == null || value === "") return undefined;
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

const propertyManagementRouteConfigContribution: RouteConfigContribution = {
    id: "propertyManagement",
    order: 20,
    contributeRoutes({menu, subview, segments, searchParams}: RouteConfigArgs) {
        if (menu === "tenancy" && subview === "systemSettings") {
            const resource = segments[2];
            const action = segments[3];
            const unitTypeId = searchParams.get("unitTypeId") || undefined;
            const unitTypeName = safeDecode(searchParams.get("unitTypeName")) || undefined;
            const storyTypeId = searchParams.get("storyTypeId") || undefined;
            const storyTypeName = safeDecode(searchParams.get("storyTypeName")) || undefined;
            const unitTypeCategoryId = searchParams.get("unitTypeCategoryId") || undefined;
            const unitTypeCategoryName = safeDecode(searchParams.get("unitTypeCategoryName")) || undefined;
            const constructorId = searchParams.get("constructorId") || undefined;
            const constructorName = safeDecode(searchParams.get("constructorName")) || undefined;

            if (resource === "unitTypeCategories") {
                if (action === "create") return <CreateUnitTypeCategory />;
                if (action === "edit" && unitTypeCategoryId) {
                    return <EditUnitTypeCategory entityId={unitTypeCategoryId} entityName={unitTypeCategoryName} />;
                }
                return <AllUnitTypeCategories />;
            }
            if (resource === "unitTypes") {
                if (action === "create") return <CreateUnitType />;
                if (action === "edit") return <EditUnitType entityId={unitTypeId} entityName={unitTypeName} />;
                return <AllUnitTypes />;
            }
            if (resource === "storyTypes") {
                if (action === "create") return <CreateStoryType />;
                if (action === "edit") return <EditStoryType entityId={storyTypeId} entityName={storyTypeName} />;
                return <AllStoryTypes />;
            }
            if (resource === "constructors") {
                if (action === "create") return <CreateConstructor />;
                if (action === "edit") return <EditConstructor entityId={constructorId} entityName={constructorName} />;
                return <AllConstructors />;
            }
            if (resource === "propertyManagementConfig") {
                return <PropertyManagementConfigGate />;
            }
            return undefined;
        }

        if (menu !== "realEstate") {
            return undefined;
        }

        const projectId = searchParams.get("projectId") || undefined;
        const projectName = safeDecode(searchParams.get("projectName")) || undefined;
        const edificeId = searchParams.get("edificeId") || undefined;
        const edificeName = safeDecode(searchParams.get("edificeName")) || undefined;
        const floorId = searchParams.get("floorId") || undefined;
        const floorName = safeDecode(searchParams.get("floorName")) || undefined;
        const unitId = searchParams.get("unitId") || undefined;
        const unitName = safeDecode(searchParams.get("unitName")) || undefined;
        const inspectionId = searchParams.get("inspectionId") || undefined;
        const inspectionName = safeDecode(searchParams.get("inspectionName")) || undefined;
        const modificationRequestId = searchParams.get("modificationRequestId") || undefined;
        const modificationRequestName = safeDecode(searchParams.get("modificationRequestName")) || undefined;
        const saleId = searchParams.get("saleId") || undefined;
        const unitCostId = searchParams.get("unitCostId") || undefined;
        const unitCostName = safeDecode(searchParams.get("unitCostName")) || undefined;
        const snagId = searchParams.get("snagId") || undefined;
        const snagName = safeDecode(searchParams.get("snagName")) || undefined;
        const projectDocumentId = searchParams.get("projectDocumentId") || undefined;
        const projectDocumentName = safeDecode(searchParams.get("projectDocumentName")) || undefined;
        const permitId = searchParams.get("permitId") || undefined;
        const permitName = safeDecode(searchParams.get("permitName")) || undefined;
        const constructionUpdateId = searchParams.get("constructionUpdateId") || undefined;
        const constructionUpdateName = safeDecode(searchParams.get("constructionUpdateName")) || undefined;
        const storyId = searchParams.get("storyId") || undefined;
        const storyName = safeDecode(searchParams.get("storyName")) || undefined;
        const leadId = searchParams.get("leadId") || undefined;
        const leadName = safeDecode(searchParams.get("leadName")) || undefined;
        const leaseId = searchParams.get("leaseId") || undefined;
        const leaseName = safeDecode(searchParams.get("leaseName")) || undefined;
        const rentalPaymentId = searchParams.get("rentalPaymentId") || undefined;
        const rentalPaymentName = safeDecode(searchParams.get("rentalPaymentName")) || undefined;
        const action = segments[2];

        if (subview === "systemmap") {
            return <PropertyManagementSystemMap />;
        }

        if (subview === "overview") {
            return <Dashboard />;
        }

        if (subview === "dashboard") {
            return <RealEstateDashboard />;
        }

        if (subview === "roi") {
            return <RoiCalculator />;
        }

        if (subview === "snags") {
            if (action === "create") return <CreateSnag />;
            if (action === "edit" && snagId) return <EditSnag entityId={snagId} entityName={snagName} />;
            return <AllSnags unitId={unitId} unitName={unitName} />;
        }

        if (subview === "projectDocuments") {
            if (action === "create") return <CreateProjectDocument />;
            if (action === "edit" && projectDocumentId) {
                return <EditProjectDocument entityId={projectDocumentId} entityName={projectDocumentName} />;
            }
            return <AllProjectDocuments projectId={projectId} projectName={projectName} />;
        }

        if (subview === "permits") {
            if (action === "create") return <CreatePermit />;
            if (action === "edit" && permitId) return <EditPermit entityId={permitId} entityName={permitName} />;
            return <AllPermits projectId={projectId} projectName={projectName} />;
        }

        if (subview === "constructionUpdates") {
            if (action === "create") return <CreateConstructionUpdate />;
            if (action === "edit" && constructionUpdateId) {
                return <EditConstructionUpdate entityId={constructionUpdateId} entityName={constructionUpdateName} />;
            }
            return <AllConstructionUpdates projectId={projectId} projectName={projectName} />;
        }

        if (subview === "stories") {
            if (action === "create") return <CreateStory />;
            if (action === "edit" && storyId) {
                return <EditStory entityId={storyId} entityName={storyName} />;
            }
            return <AllStories projectId={projectId} projectName={projectName} />;
        }

        if (subview === "projects") {
            if (action === "create") return <CreateProject />;
            if (action === "edit") return <EditProject entityId={projectId} entityName={projectName} />;
            return <AllProjects />;
        }

        if (subview === "edifices") {
            if (action === "create") return <CreateEdifice />;
            if (action === "edit") return <EditEdifice entityId={edificeId} entityName={edificeName} />;
            return <AllEdifices />;
        }

        if (subview === "floors") {
            if (action === "create") return <CreateFloor />;
            if (action === "edit") return <EditFloor entityId={floorId} entityName={floorName} />;
            return <AllFloors />;
        }

        if (subview === "units") {
            if (action === "create") return <CreateUnit />;
            if (action === "edit") return <EditUnit entityId={unitId} entityName={unitName} />;
            if (action === "availability") return <UnitAvailabilityCalendar />;
            return <AllUnits />;
        }

        if (subview === "inspections") {
            if (action === "create") return <CreateInspection />;
            if (action === "edit") return <EditInspection entityId={inspectionId} entityName={inspectionName} />;
            return <AllInspections />;
        }

        if (subview === "unitCosts") {
            if (action === "create") return <CreateUnitCost />;
            if (action === "edit") return <EditUnitCost entityId={unitCostId} entityName={unitCostName} />;
            return <AllUnitCosts unitId={unitId} unitName={unitName} />;
        }

        if (subview === "modificationRequests") {
            if (action === "create") return <CreateModificationRequest />;
            if (action === "edit") {
                return <EditModificationRequest entityId={modificationRequestId} entityName={modificationRequestName} />;
            }
            return <AllModificationRequests />;
        }

        if (subview === "reservations") {
            if (action === "create") return <CreateReservation unitId={unitId} unitName={unitName} />;
            return <AllReservations />;
        }

        if (subview === "sales") {
            const thirdSegment = segments[2];
            const fourthSegment = segments[3];
            if (thirdSegment === "create" && !fourthSegment) return <CreateSaleChoice unitId={unitId} unitName={unitName} />;
            if (thirdSegment === "create" && fourthSegment === "cash") return <CreateCashSale unitId={unitId} unitName={unitName} />;
            if (thirdSegment === "create" && fourthSegment === "paymentPlan") {
                return <CreatePaymentPlanSale unitId={unitId} unitName={unitName} />;
            }
            if (action === "edit" && saleId) return <EditSale entityId={saleId} entityName={unitName} />;
            return <AllSales />;
        }

        if (subview === "commissions") {
            return <AllCommissions />;
        }

        if (subview === "agentReport") {
            return <AgentReport />;
        }

        if (subview === "contractsHub") {
            return <ContractsHub />;
        }

        if (subview === "leads") {
            if (action === "create") return <CreateLead />;
            if (action === "edit" && leadId) return <EditLead entityId={leadId} entityName={leadName} />;
            return <AllLeads />;
        }

        if (subview === "rentalsHub" || subview === "ownerPortal") {
            return <RentalsHub />;
        }

        if (subview === "leases") {
            if (action === "create") return <CreateLease />;
            if (action === "edit" && leaseId) return <EditLease entityId={leaseId} entityName={leaseName} />;
            return <AllLeases unitId={unitId} unitName={unitName} />;
        }

        if (subview === "rentalPayments") {
            if (action === "create") return <CreateRentalPayment />;
            if (action === "edit" && rentalPaymentId) {
                return <EditRentalPayment entityId={rentalPaymentId} entityName={rentalPaymentName} />;
            }
            return <AllRentalPayments leaseId={leaseId} leaseName={leaseName} />;
        }

        if (subview === "erpExport") {
            return <ErpExport />;
        }

        if (subview === "groupDashboard") {
            return <GroupDashboard />;
        }

        if (subview === "estimateComparison") {
            return <EstimateComparison />;
        }
        if (subview === "bidComparison") {
            return <BidComparison tenderId={searchParams.get("tenderId") || undefined} />;
        }
        if (subview === "costControl") {
            return <CostControl projectId={searchParams.get("projectId") || projectId || undefined} />;
        }
        if (subview === "cockpit") {
            return <Cockpit projectId={searchParams.get("projectId") || projectId || undefined} />;
        }
        if (subview === "specifications") {
            const id = searchParams.get("specificationId") || undefined;
            const name = safeDecode(searchParams.get("specificationName")) || undefined;
            if (action === "create") return <CreateSpecification />;
            if (action === "edit" && id) return <EditSpecification entityId={id} entityName={name} />;
            return <AllSpecifications projectId={projectId} />;
        }
        if (subview === "specificationItems") {
            const id = searchParams.get("specificationItemId") || undefined;
            const name = safeDecode(searchParams.get("specificationItemName")) || undefined;
            if (action === "create") return <CreateSpecificationItem />;
            if (action === "edit" && id) return <EditSpecificationItem entityId={id} entityName={name} />;
            return <AllSpecificationItems />;
        }
        if (subview === "tenders") {
            const id = searchParams.get("tenderId") || undefined;
            const name = safeDecode(searchParams.get("tenderName")) || undefined;
            if (action === "create") return <CreateTender />;
            if (action === "edit" && id) return <EditTender entityId={id} entityName={name} />;
            return <AllTenders projectId={projectId} />;
        }
        if (subview === "tenderInvitations") {
            const id = searchParams.get("tenderInvitationId") || undefined;
            const name = safeDecode(searchParams.get("tenderInvitationName")) || undefined;
            if (action === "create") return <CreateTenderInvitation />;
            if (action === "edit" && id) return <EditTenderInvitation entityId={id} entityName={name} />;
            return <AllTenderInvitations />;
        }
        if (subview === "bids") {
            const id = searchParams.get("bidId") || undefined;
            const name = safeDecode(searchParams.get("bidName")) || undefined;
            if (action === "create") return <CreateBid />;
            if (action === "edit" && id) return <EditBid entityId={id} entityName={name} />;
            return <AllBids />;
        }
        if (subview === "bidLines") {
            const id = searchParams.get("bidLineId") || undefined;
            const name = safeDecode(searchParams.get("bidLineName")) || undefined;
            if (action === "create") return <CreateBidLine />;
            if (action === "edit" && id) return <EditBidLine entityId={id} entityName={name} />;
            return <AllBidLines />;
        }
        if (subview === "approvalWorkflows") {
            const id = searchParams.get("approvalWorkflowId") || undefined;
            const name = safeDecode(searchParams.get("approvalWorkflowName")) || undefined;
            if (action === "create") return <CreateApprovalWorkflow />;
            if (action === "edit" && id) return <EditApprovalWorkflow entityId={id} entityName={name} />;
            return <AllApprovalWorkflows />;
        }
        if (subview === "approvalRequests") {
            const id = searchParams.get("approvalRequestId") || undefined;
            const name = safeDecode(searchParams.get("approvalRequestName")) || undefined;
            if (action === "create") return <CreateApprovalRequest />;
            if (action === "edit" && id) return <EditApprovalRequest entityId={id} entityName={name} />;
            return <AllApprovalRequests />;
        }
        if (subview === "contractorInvoices") {
            const id = searchParams.get("contractorInvoiceId") || undefined;
            const name = safeDecode(searchParams.get("contractorInvoiceName")) || undefined;
            if (action === "create") return <CreateContractorInvoice />;
            if (action === "edit" && id) return <EditContractorInvoice entityId={id} entityName={name} />;
            return <AllContractorInvoices />;
        }
        if (subview === "incomingInvoices") {
            const id = searchParams.get("incomingInvoiceId") || undefined;
            const name = safeDecode(searchParams.get("incomingInvoiceName")) || undefined;
            if (action === "create") return <CreateIncomingInvoice />;
            if (action === "edit" && id) return <EditIncomingInvoice entityId={id} entityName={name} />;
            return <AllIncomingInvoices />;
        }
        if (subview === "liquidityPlans") {
            const id = searchParams.get("liquidityPlanId") || undefined;
            const name = safeDecode(searchParams.get("liquidityPlanName")) || undefined;
            if (action === "create") return <CreateLiquidityPlan />;
            if (action === "edit" && id) return <EditLiquidityPlan entityId={id} entityName={name} />;
            return <AllLiquidityPlans />;
        }
        if (subview === "liquidityLines") {
            const id = searchParams.get("liquidityLineId") || undefined;
            const name = safeDecode(searchParams.get("liquidityLineName")) || undefined;
            if (action === "create") return <CreateLiquidityLine />;
            if (action === "edit" && id) return <EditLiquidityLine entityId={id} entityName={name} />;
            return <AllLiquidityLines />;
        }
        if (subview === "feeCalculations") {
            const id = searchParams.get("feeCalculationId") || undefined;
            const name = safeDecode(searchParams.get("feeCalculationName")) || undefined;
            if (action === "create") return <CreateFeeCalculation />;
            if (action === "edit" && id) return <EditFeeCalculation entityId={id} entityName={name} />;
            return <AllFeeCalculations />;
        }
        if (subview === "planMarkups") {
            const id = searchParams.get("planMarkupId") || undefined;
            const name = safeDecode(searchParams.get("planMarkupName")) || undefined;
            if (action === "create") return <CreatePlanMarkup />;
            if (action === "edit" && id) return <EditPlanMarkup entityId={id} entityName={name} />;
            return <AllPlanMarkups />;
        }
        if (subview === "assets") {
            const id = searchParams.get("assetId") || undefined;
            const name = safeDecode(searchParams.get("assetName")) || undefined;
            if (action === "create") return <CreateAsset />;
            if (action === "edit" && id) return <EditAsset entityId={id} entityName={name} />;
            return <AllAssets />;
        }
        if (subview === "maintenancePlans") {
            const id = searchParams.get("maintenancePlanId") || undefined;
            const name = safeDecode(searchParams.get("maintenancePlanName")) || undefined;
            if (action === "create") return <CreateMaintenancePlan />;
            if (action === "edit" && id) return <EditMaintenancePlan entityId={id} entityName={name} />;
            return <AllMaintenancePlans />;
        }
        if (subview === "maintenanceWorkOrders") {
            const id = searchParams.get("maintenanceWorkOrderId") || undefined;
            const name = safeDecode(searchParams.get("maintenanceWorkOrderName")) || undefined;
            if (action === "create") return <CreateMaintenanceWorkOrder />;
            if (action === "edit" && id) return <EditMaintenanceWorkOrder entityId={id} entityName={name} />;
            return <AllMaintenanceWorkOrders />;
        }
        if (subview === "bimModels") {
            const id = searchParams.get("bimModelId") || undefined;
            const name = safeDecode(searchParams.get("bimModelName")) || undefined;
            if (action === "create") return <CreateBimModel />;
            if (action === "edit" && id) return <EditBimModel entityId={id} entityName={name} />;
            return <AllBimModels />;
        }
        if (subview === "bimQuantities") {
            const id = searchParams.get("bimQuantityId") || undefined;
            const name = safeDecode(searchParams.get("bimQuantityName")) || undefined;
            if (action === "create") return <CreateBimQuantity />;
            if (action === "edit" && id) return <EditBimQuantity entityId={id} entityName={name} />;
            return <AllBimQuantities />;
        }
        if (subview === "costClassifications") {
            const id = searchParams.get("costClassificationId") || undefined;
            const name = safeDecode(searchParams.get("costClassificationName")) || undefined;
            if (action === "create") return <CreateCostClassification />;
            if (action === "edit" && id) return <EditCostClassification entityId={id} entityName={name} />;
            return <AllCostClassifications />;
        }
        if (subview === "budgets") {
            const id = searchParams.get("budgetId") || undefined;
            const name = safeDecode(searchParams.get("budgetName")) || undefined;
            if (action === "create") return <CreateBudget />;
            if (action === "edit" && id) return <EditBudget entityId={id} entityName={name} />;
            return <AllBudgets projectId={projectId} projectName={projectName} />;
        }
        if (subview === "boqItems") {
            const id = searchParams.get("boqItemId") || undefined;
            const name = safeDecode(searchParams.get("boqItemName")) || undefined;
            if (action === "create") return <CreateBoqItem />;
            if (action === "edit" && id) return <EditBoqItem entityId={id} entityName={name} />;
            return <AllBoqItems projectId={projectId} projectName={projectName} />;
        }
        if (subview === "costCommitments") {
            const id = searchParams.get("costCommitmentId") || undefined;
            const name = safeDecode(searchParams.get("costCommitmentName")) || undefined;
            if (action === "create") return <CreateCostCommitment />;
            if (action === "edit" && id) return <EditCostCommitment entityId={id} entityName={name} />;
            return <AllCostCommitments projectId={projectId} projectName={projectName} />;
        }
        if (subview === "workPackages") {
            const id = searchParams.get("workPackageId") || undefined;
            const name = safeDecode(searchParams.get("workPackageName")) || undefined;
            if (action === "create") return <CreateWorkPackage />;
            if (action === "edit" && id) return <EditWorkPackage entityId={id} entityName={name} />;
            return <AllWorkPackages projectId={projectId} projectName={projectName} />;
        }
        if (subview === "constructionContracts") {
            const id = searchParams.get("constructionContractId") || undefined;
            const name = safeDecode(searchParams.get("constructionContractName")) || undefined;
            if (action === "create") return <CreateConstructionContract />;
            if (action === "edit" && id) return <EditConstructionContract entityId={id} entityName={name} />;
            return <AllConstructionContracts projectId={projectId} projectName={projectName} />;
        }
        if (subview === "progressClaims") {
            const id = searchParams.get("progressClaimId") || undefined;
            const name = safeDecode(searchParams.get("progressClaimName")) || undefined;
            if (action === "create") return <CreateProgressClaim />;
            if (action === "edit" && id) return <EditProgressClaim entityId={id} entityName={name} />;
            return <AllProgressClaims projectId={projectId} projectName={projectName} />;
        }
        if (subview === "rfis") {
            const id = searchParams.get("rfiId") || undefined;
            const name = safeDecode(searchParams.get("rfiName")) || undefined;
            if (action === "create") return <CreateRfi />;
            if (action === "edit" && id) return <EditRfi entityId={id} entityName={name} />;
            return <AllRfis projectId={projectId} projectName={projectName} />;
        }
        if (subview === "submittals") {
            const id = searchParams.get("submittalId") || undefined;
            const name = safeDecode(searchParams.get("submittalName")) || undefined;
            if (action === "create") return <CreateSubmittal />;
            if (action === "edit" && id) return <EditSubmittal entityId={id} entityName={name} />;
            return <AllSubmittals projectId={projectId} projectName={projectName} />;
        }
        if (subview === "variationOrders") {
            const id = searchParams.get("variationOrderId") || undefined;
            const name = safeDecode(searchParams.get("variationOrderName")) || undefined;
            if (action === "create") return <CreateVariationOrder />;
            if (action === "edit" && id) return <EditVariationOrder entityId={id} entityName={name} />;
            return <AllVariationOrders projectId={projectId} projectName={projectName} />;
        }
        if (subview === "landParcels") {
            const id = searchParams.get("landParcelId") || undefined;
            const name = safeDecode(searchParams.get("landParcelName")) || undefined;
            if (action === "create") return <CreateLandParcel />;
            if (action === "edit" && id) return <EditLandParcel entityId={id} entityName={name} />;
            return <AllLandParcels projectId={projectId} projectName={projectName} />;
        }
        if (subview === "feasibilityStudies") {
            const id = searchParams.get("feasibilityStudyId") || undefined;
            const name = safeDecode(searchParams.get("feasibilityStudyName")) || undefined;
            if (action === "create") return <CreateFeasibilityStudy />;
            if (action === "edit" && id) return <EditFeasibilityStudy entityId={id} entityName={name} />;
            return <AllFeasibilityStudys projectId={projectId} projectName={projectName} />;
        }
        if (subview === "siteDiaries") {
            const id = searchParams.get("siteDiaryId") || undefined;
            const name = safeDecode(searchParams.get("siteDiaryName")) || undefined;
            if (action === "create") return <CreateSiteDiary />;
            if (action === "edit" && id) return <EditSiteDiary entityId={id} entityName={name} />;
            return <AllSiteDiarys projectId={projectId} projectName={projectName} />;
        }
        if (subview === "safetyIncidents") {
            const id = searchParams.get("safetyIncidentId") || undefined;
            const name = safeDecode(searchParams.get("safetyIncidentName")) || undefined;
            if (action === "create") return <CreateSafetyIncident />;
            if (action === "edit" && id) return <EditSafetyIncident entityId={id} entityName={name} />;
            return <AllSafetyIncidents projectId={projectId} projectName={projectName} />;
        }
        if (subview === "warranties") {
            const id = searchParams.get("warrantyId") || undefined;
            const name = safeDecode(searchParams.get("warrantyName")) || undefined;
            if (action === "create") return <CreateWarranty />;
            if (action === "edit" && id) return <EditWarranty entityId={id} entityName={name} />;
            return <AllWarrantys projectId={projectId} projectName={projectName} />;
        }
        if (subview === "handoverPackages") {
            const id = searchParams.get("handoverPackageId") || undefined;
            const name = safeDecode(searchParams.get("handoverPackageName")) || undefined;
            if (action === "create") return <CreateHandoverPackage />;
            if (action === "edit" && id) return <EditHandoverPackage entityId={id} entityName={name} />;
            return <AllHandoverPackages projectId={projectId} projectName={projectName} />;
        }
        if (subview === "commissioningRecords") {
            const id = searchParams.get("commissioningRecordId") || undefined;
            const name = safeDecode(searchParams.get("commissioningRecordName")) || undefined;
            if (action === "create") return <CreateCommissioningRecord />;
            if (action === "edit" && id) return <EditCommissioningRecord entityId={id} entityName={name} />;
            return <AllCommissioningRecords projectId={projectId} projectName={projectName} />;
        }
        if (subview === "designStages") {
            const id = searchParams.get("designStageId") || undefined;
            const name = safeDecode(searchParams.get("designStageName")) || undefined;
            if (action === "create") return <CreateDesignStage />;
            if (action === "edit" && id) return <EditDesignStage entityId={id} entityName={name} />;
            return <AllDesignStages projectId={projectId} projectName={projectName} />;
        }
        if (subview === "inspectionChecklistTemplates") {
            const id = searchParams.get("inspectionChecklistTemplateId") || undefined;
            const name = safeDecode(searchParams.get("inspectionChecklistTemplateName")) || undefined;
            if (action === "create") return <CreateInspectionChecklistTemplate />;
            if (action === "edit" && id) return <EditInspectionChecklistTemplate entityId={id} entityName={name} />;
            return <AllInspectionChecklistTemplates projectId={projectId} projectName={projectName} />;
        }
        if (subview === "consultantAppointments") {
            const id = searchParams.get("consultantAppointmentId") || undefined;
            const name = safeDecode(searchParams.get("consultantAppointmentName")) || undefined;
            if (action === "create") return <CreateConsultantAppointment />;
            if (action === "edit" && id) return <EditConsultantAppointment entityId={id} entityName={name} />;
            return <AllConsultantAppointments projectId={projectId} projectName={projectName} />;
        }
        if (subview === "milestones") {
            const id = searchParams.get("milestoneId") || undefined;
            const name = safeDecode(searchParams.get("milestoneName")) || undefined;
            if (action === "create") return <CreateMilestone />;
            if (action === "edit" && id) return <EditMilestone entityId={id} entityName={name} />;
            return <AllMilestones projectId={projectId} projectName={projectName} />;
        }
        if (subview === "scheduleTasks") {
            const id = searchParams.get("scheduleTaskId") || undefined;
            const name = safeDecode(searchParams.get("scheduleTaskName")) || undefined;
            if (action === "create") return <CreateScheduleTask />;
            if (action === "edit" && id) return <EditScheduleTask entityId={id} entityName={name} />;
            return <AllScheduleTasks projectId={projectId} projectName={projectName} />;
        }

                return undefined;
    },
};

export default propertyManagementRouteConfigContribution;
