# View Object Specification

## View Structure

```typescript
interface View {
  id: string;
  name: string;
  type: ViewType; // 'table' | 'kanban' | 'list' | 'grid' | 'raw'
  
  // Display Configuration
  attributes?: Attribute[]; // Only present in default view from _config
  visibleColumns?: string[];
  columnOrder?: string[];
  columnSizes?: Record<string, number>;
  
  // Data Configuration
  filters?: FilterGroup;
  sorts?: Sort[];
  
  // Pagination - runtime only, not persisted
  perPage?: number;
  
  // View metadata
  isDefault?: boolean;
}
```

## Attribute Structure

```typescript
interface Attribute {
  name: string;
  label: string;
  type: 'string' | 'number' | 'decimal' | 'boolean' | 'date' | 'datetime';
}
```

## Example View Object

```javascript
{
  id: "view-1",
  name: "Active Investors",
  type: "table",
  
  // All available columns
  attributes: [
    { name: "id", label: "ID", type: "string" },
    { name: "name", label: "Name", type: "string" },
    { name: "email", label: "Email", type: "string" },
    { name: "pan", label: "PAN", type: "string" },
    { name: "mobile_number", label: "Mobile Number", type: "string" },
    { name: "current_value", label: "Current Value", type: "decimal" },
    { name: "invested_value", label: "Invested Value", type: "decimal" },
    { name: "created_at", label: "Created At", type: "datetime" }
  ],
  
  // Display only these columns
  visibleColumns: ["name", "email", "current_value", "invested_value"],
  
  // Display columns in this order
  columnOrder: ["name", "email", "invested_value", "current_value"],
  
  // Column widths in pixels
  columnSizes: {
    "name": 200,
    "email": 250,
    "invested_value": 150,
    "current_value": 150
  },
  
  // Default filters applied
  filters: {
    operator: "AND",
    conditions: [
      { field: "status", operator: "=", value: "active" }
    ]
  },
  
  // Default sort
  sorts: [
    { field: "created_at", direction: "desc" }
  ]
}
```

## Default Behavior

When display configuration is not specified:

```javascript
// Custom view (no attributes)
{
  id: "view-2",
  name: "Active Investors",
  type: "table",
  visibleColumns: ["name", "email", "status"],
  filters: {...},
  sorts: [...]
}

// Default view (from _config)
{
  id: "default",
  name: "Default",
  type: "table", // Always table
  isDefault: true,
  attributes: [...], // From _config endpoint
  // Can have display config from backend
  visibleColumns: [...],
  columnOrder: [...]
}
```

## Usage in Components

```javascript
// Inside RawDisplay or any view component
export function RawDisplay() {
  const { view } = useViewContext();
  
  console.log(view);
  // {
  //   id: "raw-view-1",
  //   name: "Raw Data",
  //   type: "raw",
  //   attributes: [...],
  //   visibleColumns: [...],
  //   columnOrder: [...],
  //   columnSizes: {...},
  //   filters: {...},
  //   sorts: [...],
  //   perPage: 10
  // }
  
  // Get display columns
  const displayColumns = view.visibleColumns || view.attributes.map(attr => attr.name);
  
  // Get ordered columns
  const orderedColumns = view.columnOrder || displayColumns;
  
  // Use for rendering...
}
```

## Key Points

1. **Default View** (from _config):
   - Always has `type: 'table'`
   - Always has `isDefault: true`
   - Always includes `attributes` array
   - Cannot be deleted
   
2. **Custom Views** (from views endpoint):
   - Do not have `attributes`
   - Can be any view type
   - Can be created, updated, and deleted
   - Persist: visibleColumns, columnOrder, columnSizes, filters, sorts

3. **Display Configuration**:
   - **visibleColumns** controls which columns to show
   - **columnOrder** controls the display order
   - **columnSizes** defines column widths
   - **perPage** is runtime only, not persisted

## Data Source

The `attributes` array is populated from the `_config` endpoint response:

```javascript
// From _config response
{
  "attributes": {
    "id": { "name": "id", "label": "ID", "type": "string", ... },
    "name": { "name": "name", "label": "Name", "type": "string", ... },
    // ...
  }
}

// Transformed to view.attributes
[
  { "name": "id", "label": "ID", "type": "string" },
  { "name": "name", "label": "Name", "type": "string" },
  // ...
]
```

Only `name`, `label`, and `type` are extracted for the view object.