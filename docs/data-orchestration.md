# Lens Data Orchestration

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Lens Component                             │
│  └── QueryClientProvider (React Query)                       │
│      └── LensProvider                                        │
│          ├── Creates API instance using useLensApi           │
│          ├── Fetches: config, views list                     │
│          ├── Provides: { query, views, config, api, etc }    │
│          └── LensContent (manages activeViewId state)        │
│              ├── Handles loading/error states                │
│              ├── Toolbar (view selector)                     │
│              │   ├── Receives: activeViewId, onViewChange    │
│              │   └── Uses: views from LensProvider           │
│              └── ViewProvider (provides active view object)  │
│                  ├── Receives: view prop                     │
│                  ├── Provides: { view } to children          │
│                  └── Children:                               │
│                      ├── FilterToolbar                       │
│                      │   └── Uses view for filters/search   │
│                      └── ViewContainer                       │
│                          └── Renders view-specific component │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. **LensProvider** (`contexts/lens-context.tsx`)
- **Creates**: API endpoints using `createEndpoints(query, baseUrl)`
- **Fetches**: `api.config()`, `api.views()`
- **Provides**: `{ query, baseUrl, endpoints, headers, views, config, api, isLoading, error }`

### 2. **ViewProvider** (`contexts/view-context.tsx`)
- **Props**: `view: View`
- **Provides**: `{ view }`

### 3. **Toolbar** (`components/toolbar/toolbar.tsx`)
- **Props**: 
  - `activeViewId`: string
  - `onViewChange`: (viewId: string) => void
- **Context**: Uses `views` from LensProvider

## Data Flow

1. **Initial Load**:
   - LensProvider fetches config and views
   - LensContent sets initial activeViewId (default view or first view)
   - ViewProvider wraps components with the active view object

2. **View Switching**:
   - User clicks view tab in Toolbar
   - Toolbar calls `onViewChange(viewId)`
   - LensContent updates activeViewId state
   - ViewProvider receives new view object
   - FilterToolbar and ViewContainer re-render with new view context

3. **Data Access**:
   - View components use `useViewContext()` to get the current view
   - Each view component uses view.filters, view.search, etc.
   - Components fetch data using the view's configuration

## API Calls

```typescript
// In LensProvider:
const api = useLensApi({ endpoints, headers });
api.config()    // Get lens configuration
api.views()     // Get list of available views

// In view components (TableView, RawDisplay, etc.):
const { view } = useViewContext();
const { api, endpoints } = useLensContext();

// Example: RawDisplay using infinite fetch
const { flatData } = useInfiniteFetch({
  endpoint: endpoints.query,
  filters: view.filters,
  search: view.search,
  perPage: view.config?.perPage
});
```

## Component Hierarchy

```
Lens
└── QueryClientProvider
    └── LensProvider (provides: query, views, api, endpoints, etc.)
        └── LensContent (manages: activeViewId state)
            ├── Toolbar (props: activeViewId, onViewChange)
            └── ViewProvider (props: view={activeView})
                ├── FilterToolbar (uses: view.filters, view.search)
                └── ViewContainer (uses: view.type)
                    └── [TableView|KanbanView|ListView|RawDisplay] (uses: view.*)
```