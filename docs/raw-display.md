# RawDisplay Component

## Usage

Create a view with type `"raw"` in your backend:

```json
{
  "id": "raw-view-1",
  "name": "Raw Data View",
  "type": "raw",
  "filters": {},
  "config": {
    "perPage": 20
  }
}
```

## Context Dependencies

- **LensContext**: `{ query, endpoints, headers }`
- **ViewContext**: `{ view }`

## View Configuration

The component uses the following view properties:
- `view.id`: Query key component
- `view.filters`: Filter object
- `view.search`: Search string
- `view.globalContext`: Global context object
- `view.sorts`: Array of sort configurations
- `view.config.perPage` or `view.perPage`: Items per page (default: 10)

## Request Format

The component sends POST requests in this format:

```json
{
  "pagination": {
    "type": "cursor",
    "per_page": 10,
    "cursor": null
  },
  "search": "",
  "globalContext": {...},
  "filters": {...},
  "query": "query_name",
  "sorts": []
}
```

## Implementation Details

- Uses `useInfiniteFetch` hook for data fetching
- Implements `useFetchMoreOnScroll` for infinite scroll
- Container height: 600px with overflow auto
- Each data row rendered as: `JSON.stringify(item)`
- Monospace font for JSON display