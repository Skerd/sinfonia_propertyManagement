# Property Management Module (Sinfonia)

Client-side UI for real-estate and property-management operations: projects, buildings, units, sales pipelines, leasing, and construction tracking.

Types from **armonia**; API from **maestro** under `/api/realEstate/`.

Enable via `VITE_ENABLED_MODULES=propertyManagement`.

## Directory layout

```
propertyManagement/
├── assets/languages/
├── clients/panel/
│   ├── private/<resource>/     # Panel pages
│   ├── sidebarContribution.tsx
│   ├── routeConfigContribution.tsx
│   ├── widgetContribution.tsx
│   └── tenancySettingsContribution.tsx
├── components/custom/            # Domain-specific UI
│   ├── projects/ edifices/ floors/ units/
│   ├── reservations/ sales/ paymentPlan/
│   ├── leases/ rentalPayments/
│   ├── inspections/ snags/ modificationRequests/
│   ├── leads/ dashboard/ cards/
│   └── …
└── helpers/
    ├── components/             # Shared sub-components (e.g. unit costs)
    ├── dashboard/              # Dashboard data helpers
    └── general/
```

## Panel pages

### Portfolio

| Page folder | Description |
|-------------|-------------|
| `projects` | Development projects |
| `edifices` | Buildings |
| `floors` | Floors |
| `unitTypes` / `unitTypeCategories` | Unit typologies |
| `units` | Individual units |
| `unitCosts` | Unit cost tracking |
| `constructors` | Construction companies |

### Sales & leasing

| Page folder | Description |
|-------------|-------------|
| `leads` | Sales leads |
| `reservations` | Unit reservations |
| `sales` | Sales contracts |
| `commissions` | Agent commissions |
| `leases` | Rental agreements |
| `rentalPayments` | Rent payments |
| `rentalsHub` | Rental operations hub |
| `contractsHub` | Contract management hub |
| `ownerPortal` | Owner-facing portal views |

### Operations & reporting

| Page folder | Description |
|-------------|-------------|
| `constructionUpdates` | Build progress |
| `snags` | Defect tracking |
| `inspections` | Unit inspections |
| `modificationRequests` | Buyer modification requests |
| `dashboard` / `groupDashboard` | Analytics dashboards |
| `agentReport` | Agent reports |
| `overview` | Portfolio overview |
| `erpExport` | ERP export UI |

## Custom components

Complex real-estate workflows (floor plans, unit grids, payment plan editors, dashboard cards) use bespoke components in `components/custom/` rather than generic view-engine pages alone.

## Contributions

- **Sidebar** — property management nav groups
- **Routes** — maps `/propertyManagement/...` (and related menu paths) to pages
- **Widgets** — dashboard KPIs for sales, construction, rentals
- **Tenancy settings** — property-specific company configuration

## Path alias

```ts
import UnitsPage from "@propertyManagementModule/clients/panel/private/units";
```

## Related packages

| Package | Location |
|---------|----------|
| Armonia contracts | [`armonia/src/modules/propertyManagement`](../../../armonia/src/modules/propertyManagement/README.md) |
| API server | [`maestro/modules/propertyManagement`](../../../maestro/modules/propertyManagement/README.md) |
