# Lens Design - Views

## Core Concept: Query → Multiple Views

One query (like "users") can have multiple views:
- Default table view (always exists)
- Custom table with different columns
- Kanban view grouped by status
- List view for mobile

Each view can show:
- All data from the query
- Filtered subset (e.g., only active users)
- Different columns/fields
- Different sorting

## View Structure

```typescript
interface View {
  id: string;              // "default", "active-users", "by-status"
  name: string;            // "All Users", "Active Only", "Status Board"
  type: 'table' | 'kanban' | 'list';
  
  // What data to show
  filters?: Filter[];      // View-specific filters
  columns?: string[];      // Which fields to display
  
  // How to show it
  config: {
    // Table specific
    columnSizes?: Record<string, number>;
    columnOrder?: string[];
    hiddenColumns?: string[];
    
    // Kanban specific  
    groupBy?: string;
    
    // Any view-specific settings
    [key: string]: any;
  };
  
  // Permissions
  visibility?: 'public' | 'private' | 'protected';
  owner?: string;
  pinned?: boolean;
}
```

## View Endpoints

### 1. Fetch All Views
```
GET /api/{query}/views/_read

Response:
{
  "views": [
    {
      "id": "default",
      "name": "Default View",
      "type": "table",
      "config": { ... }
    },
    {
      "id": "active-only",
      "name": "Active Users",
      "type": "table", 
      "filters": [
        { "field": "status", "operator": "equals", "value": "active" }
      ],
      "config": { ... }
    }
  ]
}
```

### 2. Fetch Single View
```
GET /api/{query}/views/{viewId}/_read

Response:
{
  "id": "active-only",
  "name": "Active Users",
  "type": "table",
  "filters": [ ... ],
  "config": {
    "columns": ["name", "email", "status"],
    "columnSizes": { "name": 200, "email": 300 },
    "sortBy": "name",
    "sortDirection": "asc"
  }
}
```

## URL Construction

We need a utility to build all endpoints from query and baseUrl:

```typescript
import { createEndpoints } from '@locospec/lens-react';

// Create all endpoints
const endpoints = createEndpoints('users', 'https://api.example.com');

// Use them
fetch(endpoints.views.list);  // GET https://api.example.com/users/views/_read
fetch(endpoints.views.get('active-only'));  // GET https://api.example.com/users/views/active-only/_read
fetch(endpoints.read, { method: 'POST', body: ... });  // POST https://api.example.com/users/_read
```

## How Views Work in Practice

1. **Lens loads** → Fetches all views for the query
2. **User sees view switcher** → Can choose between Default, Active Only, Status Board, etc.
3. **User selects a view** → Lens fetches that specific view's config
4. **View applies its filters** → When fetching data, view's filters are merged with any user filters
5. **View renders** → Table shows only configured columns, Kanban groups by configured field

Example flow:
```tsx
<Lens query="users" baseUrl="/api" />

// 1. Lens fetches: GET /api/users/views/_read
// 2. Gets: [{ id: "default", ... }, { id: "active-only", ... }]
// 3. User clicks "Active Only" view
// 4. Lens fetches: GET /api/users/views/active-only/_read
// 5. Applies filters from view when fetching data
// 6. Shows table with only active users
```