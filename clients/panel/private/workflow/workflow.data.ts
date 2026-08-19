import type {SystemMapFlow} from "@coreModule/components/custom/systemMap/systemMap.types.ts";

type LinearStep = {
    id: string;
    label: string;
    description: string;
    detail: string;
    edgeLabel?: string;
};

type Backtrack = {
    from: string;
    to: string;
    label: string;
};

function linearFlow(
    id: string,
    title: string,
    summary: string,
    steps: LinearStep[],
    backtracks: Backtrack[] = [],
): SystemMapFlow {
    return {
        id,
        title,
        summary,
        module: "propertyManagement",
        steps: steps.map((step, index) => ({
            id: step.id,
            label: step.label,
            description: step.description,
            detail: step.detail,
            position: {x: index * 240, y: 80},
        })),
        edges: [
            ...steps.slice(1).map((step, index) => ({
                id: `f-${id}-${index + 1}`,
                source: steps[index].id,
                target: step.id,
                label: step.edgeLabel,
            })),
            ...backtracks.map((edge, index) => ({
                id: `b-${id}-${index + 1}`,
                source: edge.from,
                target: edge.to,
                label: edge.label,
                backtrack: true,
            })),
        ],
    };
}

/** One flow per Property Management sidebar group. */
export const PROPERTY_MANAGEMENT_MENU_FLOWS: SystemMapFlow[] = [
    linearFlow(
        "pm-development",
        "Development",
        "Land and feasibility → permits → design gates (documents as deliverables) → consultant appointments. Rejected or superseded documents reopen the design gate.",
        [
            {
                id: "dev-land",
                label: "Land parcels",
                description: "Register the site",
                detail: "LandParcel under the Project — area, status, early planning asset. Panel: /realEstate/landParcels.",
            },
            {
                id: "dev-feas",
                label: "Feasibility",
                description: "Go / no-go study",
                detail: "FeasibilityStudy findings decide whether the project proceeds. Panel: /realEstate/feasibilityStudies.",
            },
            {
                id: "dev-permit",
                label: "Permits",
                description: "Regulatory approvals",
                detail: "Permit types with expiry tracking and reminder cron. Panel: /realEstate/permits.",
            },
            {
                id: "dev-design",
                label: "Design stages",
                description: "Phase gates",
                detail: "DesignStage completion is gated by required ProjectDocument deliverables. Panel: /realEstate/designStages.",
            },
            {
                id: "dev-docs",
                label: "Project documents",
                description: "Drawings / specs / reports",
                detail: "Revision register: submit → approve / reject → supersede → as-built. Panel: /realEstate/projectDocuments.",
            },
            {
                id: "dev-consult",
                label: "Consultants",
                description: "Appoint architects / QS / engineers",
                detail: "ConsultantAppointment feeds later SIA fee calculations. Panel: /realEstate/consultantAppointments.",
            },
        ],
        [{from: "dev-docs", to: "dev-design", label: "reject / supersede"}],
    ),
    linearFlow(
        "pm-delivery-ops",
        "Delivery",
        "Programme → work packages & contracts → site coordination (RFI / submittal / VO) → progress claims → commissioning → handover. Submittal revise-and-resubmit, VO reject, claim reject, and WP cancel loop back.",
        [
            {
                id: "del-programme",
                label: "Programme",
                description: "Milestones + schedule tasks",
                detail: "Milestone slippage cron; ScheduleTask dates under the project. Panels: /realEstate/milestones, /realEstate/scheduleTasks.",
            },
            {
                id: "del-wp",
                label: "Work packages",
                description: "planned → active → completed",
                detail: "Scoped construction work, optionally assigned to a Constructor. Panel: /realEstate/workPackages.",
            },
            {
                id: "del-contract",
                label: "Contracts",
                description: "Constructor agreements",
                detail: "ConstructionContract carries derived cost truth (approved VOs + certified claims). Panel: /realEstate/constructionContracts.",
            },
            {
                id: "del-coord",
                label: "Site coordination",
                description: "RFI / submittal / VO",
                detail: "RFI, Submittal, and VariationOrder run alongside the contract. Panels: /realEstate/rfis, /realEstate/submittals, /realEstate/variationOrders.",
            },
            {
                id: "del-claim",
                label: "Progress claims",
                description: "Pay for certified progress",
                detail: "ProgressClaim against the contract, capped by value + approved variations. Panel: /realEstate/progressClaims.",
            },
            {
                id: "del-comm",
                label: "Commissioning",
                description: "Systems ready",
                detail: "CommissioningRecord before practical completion. Panel: /realEstate/commissioningRecords.",
            },
            {
                id: "del-ho",
                label: "Handover",
                description: "Package + close-out",
                detail: "HandoverPackage documentation at project / unit completion. Panel: /realEstate/handoverPackages.",
            },
        ],
        [
            {from: "del-wp", to: "del-programme", label: "cancel WP"},
            {from: "del-coord", to: "del-wp", label: "revise / reject"},
            {from: "del-coord", to: "del-contract", label: "VO reject"},
            {from: "del-claim", to: "del-coord", label: "reject claim"},
        ],
    ),
    linearFlow(
        "pm-cost",
        "Cost control",
        "eBKP-H / BKP classifications → budget lock → BoQ → estimate comparison → commitments → live cost control ledger. Cancelled POs and KV-Mutation supersede return to the budget.",
        [
            {
                id: "cost-class",
                label: "Classifications",
                description: "eBKP-H / BKP / NPK / SIA",
                detail: "Company-seeded CostClassification reference data. Panel: /realEstate/costClassifications.",
            },
            {
                id: "cost-budget",
                label: "Budget",
                description: "draft → approve → lock",
                detail: "Kostenvoranschlag with KV-Mutation revisions; can generate programme from budget. Panel: /realEstate/budgets.",
            },
            {
                id: "cost-boq",
                label: "BoQ items",
                description: "Planned vs actual lines",
                detail: "BoqItem lines coded to classification / element. Panel: /realEstate/boqItems.",
            },
            {
                id: "cost-est",
                label: "Estimate comparison",
                description: "Benchmark by code",
                detail: "Kostenermittlung — min/max/avg planned amount across projects for the same classificationCode. Panel: /realEstate/estimateComparison.",
            },
            {
                id: "cost-po",
                label: "Commitments / POs",
                description: "issue → close",
                detail: "CostCommitment against planned cost. Panel: /realEstate/costCommitments.",
            },
            {
                id: "cost-ctrl",
                label: "Cost control",
                description: "Estimated vs invoiced / paid",
                detail: "Baukostenkontrolle ledger by BKP: BoQ estimated, commitments, certified claims, contractor invoices. Panel: /realEstate/costControl.",
            },
        ],
        [
            {from: "cost-po", to: "cost-boq", label: "cancel PO"},
            {from: "cost-ctrl", to: "cost-budget", label: "supersede"},
        ],
    ),
    linearFlow(
        "pm-tendering",
        "Tendering",
        "Leistungsverzeichnis → issue tender → invite constructors → bids → comparison → award. Bids can be withdrawn or rejected; a closed or cancelled tender can be reissued to draft.",
        [
            {
                id: "tn-spec",
                label: "Specification (LV)",
                description: "draft → issued → tender_ready",
                detail: "Devisierung header; can import NPK positions from CostClassification. Panel: /realEstate/specifications.",
            },
            {
                id: "tn-pos",
                label: "LV positions",
                description: "Quantity × unit price",
                detail: "SpecificationItem — NPK chapter/position or free R-Position. Panel: /realEstate/specificationItems.",
            },
            {
                id: "tn-tender",
                label: "Tender",
                description: "publish → close",
                detail: "Ausschreibung of a Specification; deadline cron auto-closes. Panel: /realEstate/tenders.",
            },
            {
                id: "tn-invite",
                label: "Invitations",
                description: "Portal access tokens",
                detail: "TenderInvitation per Constructor (invited → viewing → submitted). Panel: /realEstate/tenderInvitations.",
            },
            {
                id: "tn-bid",
                label: "Bids",
                description: "Priced offers + lines",
                detail: "Bid / BidLine against LV positions; portal or internal submit. Panels: /realEstate/bids, /realEstate/bidLines.",
            },
            {
                id: "tn-cmp",
                label: "Bid comparison",
                description: "Rank and recommend",
                detail: "Angebotsvergleich — weighted price / quality / completeness. Panel: /realEstate/bidComparison.",
                edgeLabel: "score",
            },
            {
                id: "tn-award",
                label: "Award",
                description: "Tender + specification awarded",
                detail: "Award action on Tender (and matching Bid); specification moves to awarded. Panel: /realEstate/tenders.",
                edgeLabel: "award",
            },
        ],
        [
            {from: "tn-bid", to: "tn-invite", label: "withdraw"},
            {from: "tn-cmp", to: "tn-bid", label: "reject"},
            {from: "tn-cmp", to: "tn-tender", label: "reissue"},
        ],
    ),
    linearFlow(
        "pm-finance",
        "Finance & approval",
        "Approval workflow config → AP inbox OCR → contractor invoice → approve / pay → liquidity + consultant fees. Reject, recall, and dispute send the document back.",
        [
            {
                id: "fin-wf",
                label: "Approval workflows",
                description: "Roles + amount threshold",
                detail: "Freigabeprozess: primary approver role, escalation above threshold. Panel: /realEstate/approvalWorkflows.",
            },
            {
                id: "fin-req",
                label: "Approval requests",
                description: "pending → approved / rejected",
                detail: "Visa, approve, reject, escalate, recall against a finance document. Panel: /realEstate/approvalRequests.",
            },
            {
                id: "fin-inbox",
                label: "AP inbox",
                description: "Scan → OCR → classify → route",
                detail: "IncomingInvoice Swiss QR-bill / OCR; post spawns ContractorInvoice. Panel: /realEstate/incomingInvoices.",
            },
            {
                id: "fin-inv",
                label: "Contractor invoices",
                description: "received → approved → paid",
                detail: "Unternehmerrechnung coded to a BKP account; source manual or AP inbox. Panel: /realEstate/contractorInvoices.",
                edgeLabel: "post",
            },
            {
                id: "fin-liq",
                label: "Liquidity",
                description: "Plan + monthly lines",
                detail: "LiquidityPlan rebuilds outflows from invoices; LiquidityLine keeps manual rows. Panels: /realEstate/liquidityPlans, /realEstate/liquidityLines.",
            },
            {
                id: "fin-fee",
                label: "Fee calculations",
                description: "SIA honoraria",
                detail: "FeeCalculation from ConsultantAppointment: planned → earned → invoiced → paid. Panel: /realEstate/feeCalculations.",
            },
        ],
        [
            {from: "fin-inv", to: "fin-inbox", label: "reject / dispute"},
            {from: "fin-inv", to: "fin-req", label: "reject / recall"},
        ],
    ),
    linearFlow(
        "pm-quality",
        "Quality & HSE",
        "Inspection checklist templates → daily site diary → safety incidents → warranties / DLP after handover.",
        [
            {
                id: "qh-tpl",
                label: "Checklist templates",
                description: "Reusable inspection lists",
                detail: "InspectionChecklistTemplate used by unit inspections. Panel: /realEstate/inspectionChecklistTemplates.",
            },
            {
                id: "qh-diary",
                label: "Site diaries",
                description: "Daily site log",
                detail: "Weather, progress, manpower, and conditions. Panel: /realEstate/siteDiaries.",
            },
            {
                id: "qh-inc",
                label: "Safety incidents",
                description: "HSE records",
                detail: "Severity-tagged incident on a project site. Panel: /realEstate/safetyIncidents.",
            },
            {
                id: "qh-war",
                label: "Warranties / DLP",
                description: "Post-handover coverage",
                detail: "Warranty expiry after handover / defects liability period. Panel: /realEstate/warranties.",
            },
        ],
    ),
    linearFlow(
        "pm-facility",
        "Facility management",
        "Asset register → maintenance plan (cron) → work orders → plan markups on drawings. Cancelled work orders return to the plan; resolved markups can be reopened.",
        [
            {
                id: "fm-asset",
                label: "Assets",
                description: "planned / active / retired",
                detail: "Technical FM register on an edifice (component / equipment). Panel: /realEstate/assets.",
            },
            {
                id: "fm-plan",
                label: "Maintenance plans",
                description: "Interval + next due",
                detail: "Preventive / statutory / renovation; maintenanceDue cron or generateWorkOrder. Panel: /realEstate/maintenancePlans.",
            },
            {
                id: "fm-wo",
                label: "Work orders",
                description: "open → done → verified",
                detail: "Assign, start, complete, verify, close. Panel: /realEstate/maintenanceWorkOrders.",
                edgeLabel: "spawn",
            },
            {
                id: "fm-markup",
                label: "Plan markups",
                description: "Markers on drawings",
                detail: "Defect / decision / order / pendency / info on a ProjectDocument; can link Snag / RFI / ScheduleTask. Panel: /realEstate/planMarkups.",
            },
        ],
        [
            {from: "fm-wo", to: "fm-plan", label: "cancel"},
            {from: "fm-markup", to: "fm-wo", label: "reopen"},
        ],
    ),
    linearFlow(
        "pm-bim",
        "BIM & integrations",
        "BIM model → IFC / quantity takeoff → map to eBKP-H → push planned quantities onto the budget BoQ. Failed IFC import retries; quantities can be re-pushed after a takeoff change.",
        [
            {
                id: "bim-model",
                label: "BIM models",
                description: "IFC container",
                detail: "BimModel per project; importIfc is feature-flagged (PM_BIM_IFC_ENABLED). Panel: /realEstate/bimModels.",
            },
            {
                id: "bim-import",
                label: "Import / takeoff",
                description: "IFC or manual quantities",
                detail: "Import IFC when enabled, otherwise capture quantities manually on the model.",
            },
            {
                id: "bim-qty",
                label: "BIM quantities",
                description: "Mapped to eBKP-H",
                detail: "BimQuantity lines: ifcElementType, classificationCode, quantity, UoM. Panel: /realEstate/bimQuantities.",
            },
            {
                id: "bim-push",
                label: "Push to estimate",
                description: "Update BoQ plannedQty",
                detail: "pushToEstimate creates/updates BoqItem plannedQty on the project budget from BIM quantities.",
                edgeLabel: "pushToEstimate",
            },
        ],
        [
            {from: "bim-qty", to: "bim-import", label: "retry import"},
            {from: "bim-push", to: "bim-qty", label: "re-push"},
        ],
    ),
];
