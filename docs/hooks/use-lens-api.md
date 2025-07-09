# useLensApi Hook

The `useLensApi` hook provides a unified API interface for all Lens operations using React Query.

## Basic Usage

```typescript
import { useLensApi } from '@lens2/hooks/use-lens-api';
import { createEndpoints } from '@lens2/utils/endpoints';

const endpoints = createEndpoints('investors', 'https://api.example.com');
const api = useLensApi({ 
  endpoints, 
  headers: { 'Authorization': 'Bearer token' },
  query: 'investors'  // Required for LCS backends
});
```

## Query Methods

### `config()`
Fetches model configuration and default view settings.

```typescript
const { data: config, isLoading, error } = api.config();
```

### `views()`
Fetches all custom views (default view comes from config).

```typescript
const { data: viewsData } = api.views();
// Returns: { views: View[], defaultView: View }
```

### `customAttributes()`
Fetches custom attributes for the model.

```typescript
const { data: attributes } = api.customAttributes();
```

### `relationOptions(field, search?)`
Fetches dropdown options for relation fields.

```typescript
const { data: options } = api.relationOptions('department_id', 'eng');
```

## Mutation Methods

### `updateData()`
Updates a field value.

```typescript
const mutation = api.updateData();
mutation.mutate({ id: 123, field: 'status', value: 'active' });
```

### `createView()`
Creates a new view.

```typescript
const mutation = api.createView();
mutation.mutate({
  name: 'Active Users',
  type: 'table',
  visibleColumns: ['name', 'email'],
  filters: {}
});
```

### `updateView()`
Updates an existing view.

```typescript
const mutation = api.updateView();
mutation.mutate({
  id: 'view-123',
  name: 'Updated Name',
  visibleColumns: ['name', 'status']
});
```

### `deleteView()`
Deletes a view.

```typescript
const mutation = api.deleteView();
mutation.mutate('view-123');
```

### Custom Attribute Mutations

Similar pattern for `createCustomAttribute()`, `updateCustomAttribute()`, and `deleteCustomAttribute()`.

## Notes

- All endpoints use POST method
- Query parameter is required and passed to all methods
- Read operations include query filter automatically
- Mutations send payload directly without filters
- Default view cannot be modified or deleted