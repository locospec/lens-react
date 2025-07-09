# Lens Endpoints

Lens uses a unified endpoint structure for LCS backends.

## All Endpoints

### Data Operations
- `POST /{query}/_config` - Get model configuration and default view
- `POST /{query}/_read` - Fetch paginated data with filters
- `POST /{query}/_update` - Update a data field
- `POST /{query}/_read_relation_options` - Get dropdown options

### View Operations  
- `POST /lcs_views/_read` - List custom views (with query filter)
- `POST /lcs_views/_create` - Create a new view
- `POST /lcs_views/_update` - Update an existing view
- `POST /lcs_views/_delete` - Delete a view

### Custom Attribute Operations
- `POST /lcs_custom_attributes/_read` - List custom attributes (with query filter)
- `POST /lcs_custom_attributes/_create` - Create custom attribute
- `POST /lcs_custom_attributes/_update` - Update custom attribute
- `POST /lcs_custom_attributes/_delete` - Delete custom attribute

## Query Filter

Read operations (`_read`) include a query filter:

```json
{
  "filters": {
    "conditions": [{
      "field": "query",
      "op": "is", 
      "value": "investors"  // The query prop from Lens
    }]
  }
}
```

## Detailed Documentation

- [Data Operations](./data.md)
- [View Operations](./views.md)
- [Custom Attribute Operations](./custom-attributes.md)