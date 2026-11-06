import {lazy} from "react";
import type {RouteConfigArgs, RouteConfigContribution} from "@coreModule/helpers/types/routeConfigContribution.types.ts";

// Pages load on first visit (D21); the panel shell's Suspense boundary shows the loader.
const CreateProject = lazy(() => import("@propertyManagementModule/clients/panel/private/projects/createProject.tsx"));
const AllProjects = lazy(() => import("@propertyManagementModule/clients/panel/private/projects"));
const EditProject = lazy(() => import("@propertyManagementModule/clients/panel/private/projects/editProject.tsx"));
const CreateEdifice = lazy(() => import("@propertyManagementModule/clients/panel/private/edifices/createEdifice.tsx"));
const EditEdifice = lazy(() => import("@propertyManagementModule/clients/panel/private/edifices/editEdifice.tsx"));
const AllEdifices = lazy(() => import("@propertyManagementModule/clients/panel/private/edifices"));
const CreateFloor = lazy(() => import("@propertyManagementModule/clients/panel/private/floors/createFloor.tsx"));
const EditFloor = lazy(() => import("@propertyManagementModule/clients/panel/private/floors/editFloor.tsx"));
const AllFloors = lazy(() => import("@propertyManagementModule/clients/panel/private/floors"));
const CreateUnit = lazy(() => import("@propertyManagementModule/clients/panel/private/units/createUnit.tsx"));
const EditUnit = lazy(() => import("@propertyManagementModule/clients/panel/private/units/editUnit.tsx"));
const AllUnits = lazy(() => import("@propertyManagementModule/clients/panel/private/units"));
const UnitAvailabilityCalendar = lazy(() => import("@propertyManagementModule/clients/panel/private/units/availabilityCalendar.tsx"));
const CreateInspection = lazy(() => import("@propertyManagementModule/clients/panel/private/inspections/createInspection.tsx"));
const EditInspection = lazy(() => import("@propertyManagementModule/clients/panel/private/inspections/editInspection.tsx"));
const AllInspections = lazy(() => import("@propertyManagementModule/clients/panel/private/inspections"));
const CreateUnitCost = lazy(() => import("@propertyManagementModule/clients/panel/private/unitCosts/createUnitCost.tsx"));
const EditUnitCost = lazy(() => import("@propertyManagementModule/clients/panel/private/unitCosts/editUnitCost.tsx"));
const AllUnitCosts = lazy(() => import("@propertyManagementModule/clients/panel/private/unitCosts"));
const CreateModificationRequest = lazy(() => import("@propertyManagementModule/clients/panel/private/modificationRequests/createModificationRequest.tsx"));
const CreateUnitType = lazy(() => import("@propertyManagementModule/clients/panel/private/unitTypes/createUnitType.tsx"));
const EditUnitType = lazy(() => import("@propertyManagementModule/clients/panel/private/unitTypes/editUnitType.tsx"));
const AllUnitTypes = lazy(() => import("@propertyManagementModule/clients/panel/private/unitTypes"));
const CreateStoryType = lazy(() => import("@propertyManagementModule/clients/panel/private/storyTypes/createStoryType.tsx"));
const EditStoryType = lazy(() => import("@propertyManagementModule/clients/panel/private/storyTypes/editStoryType.tsx"));
const AllStoryTypes = lazy(() => import("@propertyManagementModule/clients/panel/private/storyTypes"));
const CreateUnitTypeCategory = lazy(() => import("@propertyManagementModule/clients/panel/private/unitTypeCategories/createUnitTypeCategory.tsx"));
const EditUnitTypeCategory = lazy(() => import("@propertyManagementModule/clients/panel/private/unitTypeCategories/editUnitTypeCategory.tsx"));
const AllUnitTypeCategories = lazy(() => import("@propertyManagementModule/clients/panel/private/unitTypeCategories"));
const CreateConstructor = lazy(() => import("@propertyManagementModule/clients/panel/private/constructors/createConstructor.tsx"));
const EditConstructor = lazy(() => import("@propertyManagementModule/clients/panel/private/constructors/editConstructor.tsx"));
const AllConstructors = lazy(() => import("@propertyManagementModule/clients/panel/private/constructors"));
const PropertyManagementConfigGate = lazy(() => import("@propertyManagementModule/clients/panel/private/propertyManagementConfig"));
const AllModificationRequests = lazy(() => import("@propertyManagementModule/clients/panel/private/modificationRequests"));
const CreateReservation = lazy(() => import("@propertyManagementModule/clients/panel/private/reservations/createReservation.tsx"));
const AllReservations = lazy(() => import("@propertyManagementModule/clients/panel/private/reservations"));
const CreateSaleChoice = lazy(() => import("@propertyManagementModule/clients/panel/private/sales/createSaleChoice.tsx"));
const CreateCashSale = lazy(() => import("@propertyManagementModule/clients/panel/private/sales/createCashSale.tsx"));
const CreatePaymentPlanSale = lazy(() => import("@propertyManagementModule/clients/panel/private/sales/createPaymentPlanSale.tsx"));
const AllSales = lazy(() => import("@propertyManagementModule/clients/panel/private/sales"));
const EditSale = lazy(() => import("@propertyManagementModule/clients/panel/private/sales/editSale.tsx"));
const AllCommissions = lazy(() => import("@propertyManagementModule/clients/panel/private/commissions"));
const AgentReport = lazy(() => import("@propertyManagementModule/clients/panel/private/agentReport"));
const ContractsHub = lazy(() => import("@propertyManagementModule/clients/panel/private/contractsHub"));
const AllLeads = lazy(() => import("@propertyManagementModule/clients/panel/private/leads"));
const CreateLead = lazy(() => import("@propertyManagementModule/clients/panel/private/leads/createLead.tsx"));
const EditLead = lazy(() => import("@propertyManagementModule/clients/panel/private/leads/editLead.tsx"));
const RentalsHub = lazy(() => import("@propertyManagementModule/clients/panel/private/rentalsHub"));
const PaymentsHub = lazy(() => import("@propertyManagementModule/clients/panel/private/paymentsHub"));
const AllLeases = lazy(() => import("@propertyManagementModule/clients/panel/private/leases"));
const CreateLease = lazy(() => import("@propertyManagementModule/clients/panel/private/leases/createLease.tsx"));
const EditLease = lazy(() => import("@propertyManagementModule/clients/panel/private/leases/editLease.tsx"));
const AllRentalPayments = lazy(() => import("@propertyManagementModule/clients/panel/private/rentalPayments"));
const CreateRentalPayment = lazy(() => import("@propertyManagementModule/clients/panel/private/rentalPayments/createRentalPayment.tsx"));
const EditRentalPayment = lazy(() => import("@propertyManagementModule/clients/panel/private/rentalPayments/editRentalPayment.tsx"));
const RealEstateDashboard = lazy(() => import("@propertyManagementModule/clients/panel/private/dashboard"));
const EditModificationRequest = lazy(() => import("@propertyManagementModule/clients/panel/private/modificationRequests/editModificationRequest.tsx"));
const Dashboard = lazy(() => import("@propertyManagementModule/clients/panel/private/overview"));
const RoiCalculator = lazy(() => import("@propertyManagementModule/clients/panel/private/overview/roi/roiCalculator.tsx"));
const AllStories = lazy(() => import("@propertyManagementModule/clients/panel/private/stories"));
const AllConstructionProgress = lazy(() => import("@propertyManagementModule/clients/panel/private/constructionProgress"));
const CreateConstructionProgress = lazy(() => import("@propertyManagementModule/clients/panel/private/constructionProgress/createConstructionProgress.tsx"));
const EditConstructionProgress = lazy(() => import("@propertyManagementModule/clients/panel/private/constructionProgress/editConstructionProgress.tsx"));
const CreateStory = lazy(() => import("@propertyManagementModule/clients/panel/private/stories/createStory.tsx"));
const EditStory = lazy(() => import("@propertyManagementModule/clients/panel/private/stories/editStory.tsx"));
const AllHandoverPackages = lazy(() => import("@propertyManagementModule/clients/panel/private/handoverPackages"));
const CreateHandoverPackage = lazy(() => import("@propertyManagementModule/clients/panel/private/handoverPackages/createHandoverPackage.tsx"));
const EditHandoverPackage = lazy(() => import("@propertyManagementModule/clients/panel/private/handoverPackages/editHandoverPackage.tsx"));
const AllInspectionChecklistTemplates = lazy(() => import("@propertyManagementModule/clients/panel/private/inspectionChecklistTemplates"));
const CreateInspectionChecklistTemplate = lazy(() => import("@propertyManagementModule/clients/panel/private/inspectionChecklistTemplates/createInspectionChecklistTemplate.tsx"));
const EditInspectionChecklistTemplate = lazy(() => import("@propertyManagementModule/clients/panel/private/inspectionChecklistTemplates/editInspectionChecklistTemplate.tsx"));
const AllAdCampaigns = lazy(() => import("@propertyManagementModule/clients/panel/private/adCampaigns"));
const CreateAdCampaign = lazy(() => import("@propertyManagementModule/clients/panel/private/adCampaigns/createAdCampaign.tsx"));
const EditAdCampaign = lazy(() => import("@propertyManagementModule/clients/panel/private/adCampaigns/editAdCampaign.tsx"));
const AdCampaignRecipients = lazy(() => import("@propertyManagementModule/clients/panel/private/adCampaigns/recipients"));
const AllAdCampaignTemplates = lazy(() => import("@propertyManagementModule/clients/panel/private/adCampaignTemplates"));
const CreateAdCampaignTemplate = lazy(() => import("@propertyManagementModule/clients/panel/private/adCampaignTemplates/createAdCampaignTemplate.tsx"));
const EditAdCampaignTemplate = lazy(() => import("@propertyManagementModule/clients/panel/private/adCampaignTemplates/editAdCampaignTemplate.tsx"));
const ErpExport = lazy(() => import("@propertyManagementModule/clients/panel/private/erpExport/erpExport.tsx"));
const GroupDashboard = lazy(() => import("@propertyManagementModule/clients/panel/private/groupDashboard/groupDashboard.tsx"));

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
            if (resource === "adCampaigns") {
                const id = searchParams.get("adCampaignId") || undefined;
                const name = safeDecode(searchParams.get("adCampaignName")) || undefined;
                if (action === "create") return <CreateAdCampaign />;
                if (action === "edit" && id) return <EditAdCampaign entityId={id} entityName={name} />;
                // Always campaign-scoped; without an id there is nothing to show.
                if (action === "recipients") return <AdCampaignRecipients campaignId={id} campaignName={name} />;
                return <AllAdCampaigns />;
            }
            if (resource === "adCampaignTemplates") {
                const id = searchParams.get("adCampaignTemplateId") || undefined;
                const name = safeDecode(searchParams.get("adCampaignTemplateName")) || undefined;
                if (action === "create") return <CreateAdCampaignTemplate />;
                if (action === "edit" && id) return <EditAdCampaignTemplate entityId={id} entityName={name} />;
                return <AllAdCampaignTemplates />;
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
