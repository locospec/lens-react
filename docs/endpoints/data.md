# Data Endpoints

## POST /{query}/_config

Fetch model configuration including attributes and default view.

**Request:**
```json
{}
```

**Response:**
```json
{
  "model": "investors",
  "attributes": [
    {"name": "id", "label": "ID", "type": "string"},
    {"name": "name", "label": "Name", "type": "string"}
  ],
  "defaultView": {
    "visibleColumns": ["name", "email"],
    "columnOrder": ["name", "email"]
  }
}
```

## POST /{query}/_read  

Fetch paginated data with filters and sorting.

**Request:**
```json
{
  "page": 1,
  "pageSize": 10,
  "filters": {},
  "sorting": [],
  "search": ""
}
```

## POST /{query}/_update

Update a data record field.

**Request:**
```json
{
  "id": 123,
  "field": "name",
  "value": "New Name"
}
```

## POST /{query}/_read_relation_options

Fetch dropdown options for relation fields.

**Request:**
```json
{
  "field": "status",
  "search": "act"
}
```