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
import PaymentsHub from "@propertyManagementModule/clients/panel/private/paymentsHub";
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
import AllStories from "@propertyManagementModule/clients/panel/private/stories";
import AllConstructionProgress from "@propertyManagementModule/clients/panel/private/constructionProgress";
import CreateConstructionProgress from "@propertyManagementModule/clients/panel/private/constructionProgress/createConstructionProgress.tsx";
import EditConstructionProgress from "@propertyManagementModule/clients/panel/private/constructionProgress/editConstructionProgress.tsx";
import CreateStory from "@propertyManagementModule/clients/panel/private/stories/createStory.tsx";
import EditStory from "@propertyManagementModule/clients/panel/private/stories/editStory.tsx";
import AllHandoverPackages from "@propertyManagementModule/clients/panel/private/handoverPackages";
import CreateHandoverPackage from "@propertyManagementModule/clients/panel/private/handoverPackages/createHandoverPackage.tsx";
import EditHandoverPackage from "@propertyManagementModule/clients/panel/private/handoverPackages/editHandoverPackage.tsx";
import AllInspectionChecklistTemplates from "@propertyManagementModule/clients/panel/private/inspectionChecklistTemplates";
import CreateInspectionChecklistTemplate from "@propertyManagementModule/clients/panel/private/inspectionChecklistTemplates/createInspectionChecklistTemplate.tsx";
import EditInspectionChecklistTemplate from "@propertyManagementModule/clients/panel/private/inspectionChecklistTemplates/editInspectionChecklistTemplate.tsx";
import ErpExport from "@propertyManagementModule/clients/panel/private/erpExport/erpExport.tsx";
import GroupDashboard from "@propertyManagementModule/clients/panel/private/groupDashboard/groupDashboard.tsx";
import type {RouteConfigArgs, RouteConfigContribution} from "@coreModule/helpers/types/routeConfigContribution.types.ts";

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
            if (resource === "handoverPackages") {
                const id = searchParams.get("handoverPackageId") || undefined;
                const name = safeDecode(searchParams.get("handoverPackageName")) || undefined;
                if (action === "create") return <CreateHandoverPackage />;
                if (action === "edit" && id) return <EditHandoverPackage entityId={id} entityName={name} />;
                return <AllHandoverPackages />;
            }
            if (resource === "inspectionChecklistTemplates") {
                const id = searchParams.get("inspectionChecklistTemplateId") || undefined;
                const name = safeDecode(searchParams.get("inspectionChecklistTemplateName")) || undefined;
                if (action === "create") return <CreateInspectionChecklistTemplate />;
                if (action === "edit" && id) return <EditInspectionChecklistTemplate entityId={id} entityName={name} />;
                return <AllInspectionChecklistTemplates />;
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
        const storyId = searchParams.get("storyId") || undefined;
        const storyName = safeDecode(searchParams.get("storyName")) || undefined;
        const constructionProgressId = searchParams.get("constructionProgressId") || undefined;
        const constructionProgressName = safeDecode(searchParams.get("constructionProgressName")) || undefined;
        const leadId = searchParams.get("leadId") || undefined;
        const leadName = safeDecode(searchParams.get("leadName")) || undefined;
        const leaseId = searchParams.get("leaseId") || undefined;
        const leaseName = safeDecode(searchParams.get("leaseName")) || undefined;
        const rentalPaymentId = searchParams.get("rentalPaymentId") || undefined;
        const rentalPaymentName = safeDecode(searchParams.get("rentalPaymentName")) || undefined;
        const action = segments[2];

        

        

        if (subview === "overview") {
            return <Dashboard />;
        }

        if (subview === "dashboard") {
            return <RealEstateDashboard />;
        }

        if (subview === "roi") {
            return <RoiCalculator />;
        }

        

        

        

        

        if (subview === "constructionProgress") {
            if (action === "create") return <CreateConstructionProgress />;
            if (action === "edit" && constructionProgressId) {
                return <EditConstructionProgress entityId={constructionProgressId} entityName={constructionProgressName} />;
            }
            return (
                <AllConstructionProgress
                    projectId={projectId}
                    projectName={projectName}
                    edificeId={edificeId}
                    edificeName={edificeName}
                />
            );
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

        if (subview === "paymentsHub") {
            return <PaymentsHub />;
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

        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        if (subview === "handoverPackages") {
            const id = searchParams.get("handoverPackageId") || undefined;
            const name = safeDecode(searchParams.get("handoverPackageName")) || undefined;
            if (action === "create") return <CreateHandoverPackage />;
            if (action === "edit" && id) return <EditHandoverPackage entityId={id} entityName={name} />;
            return <AllHandoverPackages projectId={projectId} projectName={projectName} />;
        }
        
        
        if (subview === "inspectionChecklistTemplates") {
            const id = searchParams.get("inspectionChecklistTemplateId") || undefined;
            const name = safeDecode(searchParams.get("inspectionChecklistTemplateName")) || undefined;
            if (action === "create") return <CreateInspectionChecklistTemplate />;
            if (action === "edit" && id) return <EditInspectionChecklistTemplate entityId={id} entityName={name} />;
            return <AllInspectionChecklistTemplates projectId={projectId} projectName={projectName} />;
        }
        
        
        

        return undefined;
    },
};

export default propertyManagementRouteConfigContribution;
