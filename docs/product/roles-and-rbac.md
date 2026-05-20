# Roles and RBAC

## Tenant Model

FlashFleet AI is multi-tenant. Each rental company, logistics operator, or corporate fleet is an `organization`. Users belong to an organization with one or more roles. Platform-level users can operate across organizations.

## Roles

| Role | Scope | Purpose |
| --- | --- | --- |
| Platform Admin | Global | Manages platform settings, organizations, billing, device approvals, and support escalation. |
| Rental Company Owner | Organization | Owns company setup, subscriptions, vehicles, business rules, and financial reporting. |
| Manager | Organization or branch | Operates fleet, assigns vehicles, approves maintenance, views analytics. |
| Staff | Branch | Handles bookings, check-in, check-out, customer support, and vehicle inspection. |
| Driver | Assigned vehicles | Uses vehicles for work trips and can submit inspections or incidents. |
| Customer | Own bookings | Rents vehicles, verifies identity, unlocks assigned vehicles, reports damage. |
| Maintenance Team | Assigned vehicles | Views diagnostics, service tasks, health predictions, and repair history. |

## Permission Groups

| Permission Group | Example Permissions |
| --- | --- |
| Fleet Read | View vehicles, location, status, digital twin. |
| Fleet Command | Lock, unlock, horn, lights, diagnostics, reboot device. |
| Rental Ops | Create bookings, assign vehicles, manage customer handoff. |
| Access Control | Issue, revoke, and audit unlock tokens. |
| Identity | Review KYC, face match, liveness checks. |
| Maintenance | Create tasks, close work orders, upload service documents. |
| Analytics | View revenue, utilization, risk, downtime, theft attempts. |
| Admin | Manage users, roles, branches, devices, billing. |

## RBAC Rules

- All user requests are evaluated with organization scope.
- Platform admins require step-up authentication for global operations.
- Vehicle commands require explicit permission plus current vehicle safety state.
- Offline unlock tokens are time-limited, vehicle-bound, user-bound, and action-bound.
- Sensitive records such as identity checks, access events, and command logs are append-only.

## Default Role Matrix

| Capability | Platform Admin | Owner | Manager | Staff | Driver | Customer | Maintenance |
| --- | --- | --- | --- | --- | --- | --- | --- |
| View all organizations | Yes | No | No | No | No | No | No |
| Manage organization users | Yes | Yes | Limited | No | No | No | No |
| View command center | Yes | Yes | Yes | Limited | No | No | Maintenance vehicles |
| Lock/unlock vehicle remotely | Yes | Yes | Yes | Limited | Assigned only | Booking only | No |
| Issue offline token | Yes | Yes | Yes | Limited | No | Self booking only | No |
| Manage bookings | No | Yes | Yes | Yes | No | Own bookings | No |
| View risk score | Yes | Yes | Yes | Limited | Own score | No | No |
| Manage maintenance | Yes | Yes | Yes | No | Report only | Report only | Yes |
| View financial dashboard | Yes | Yes | Yes | No | No | No | No |
