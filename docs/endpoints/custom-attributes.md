# Custom Attribute Endpoints

## POST /lcs_custom_attributes/_read

Fetch all custom attributes.

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
  "attributes": [
    {
      "id": "attr-1",
      "name": "risk_profile",
      "label": "Risk Profile",
      "type": "string",
      "metadata": {
        "options": ["low", "medium", "high"]
      }
    }
  ]
}
```

## POST /lcs_custom_attributes/_create

Create a custom attribute.

**Request:**
```json
{
  "name": "risk_profile",
  "label": "Risk Profile", 
  "type": "string",
  "metadata": {
    "options": ["low", "medium", "high"]
  }
}
```

## POST /lcs_custom_attributes/_update

Update a custom attribute.

**Request:**
```json
{
  "id": "attr-1",
  "label": "Updated Label",
  "metadata": {
    "options": ["low", "medium", "high", "very high"]
  }
}
```

## POST /lcs_custom_attributes/_delete

Delete a custom attribute.

**Request:**
```json
{
  "id": "attr-1"
}
```