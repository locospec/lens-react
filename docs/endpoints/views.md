# View Endpoints

## POST /lcs_views/_read

Fetch all custom views. Default view comes from _config.

**Request:**
```json
{
  "filters": {
    "conditions": [{
      "field": "query",
      "op": "is",
      "value": "investors"
    }]
  }
}
```

**Response:**
```json
{
  "views": [
    {
      "id": "view-1",
      "name": "Active Investors",
      "type": "table",
      "visibleColumns": ["name", "email"],
      "filters": {},
      "sorts": []
    }
  ]
}
```

## POST /lcs_views/_create

Create a new view.

**Request:**
```json
{
  "name": "My View",
  "type": "table",
  "visibleColumns": ["id", "name"],
  "filters": {},
  "sorts": []
}
```

## POST /lcs_views/_update

Update an existing view. Default view cannot be updated.

**Request:**
```json
{
  "id": "view-1",
  "name": "Updated View",
  "visibleColumns": ["id", "name", "email"]
}
```

## POST /lcs_views/_delete

Delete a view. Default view cannot be deleted.

**Request:**
```json
{
  "id": "view-1"
}
```