# Lens - Simple Start

## What is Lens?

A React component that shows data from your server.

```tsx
<Lens query="users" baseUrl="https://api.example.com" />
```

That's it. Lens will show your users data.

## How it works

When you write:
```tsx
<Lens query="invoices" baseUrl="/api" />
```

Lens makes these API calls:
- `/api/invoices/_config` - What fields exist?
- `/api/invoices/_read` - Get the data
- `/api/invoices/views/_read` - What views are available?

Then it shows the data as a table, kanban, or list - whatever the server says.

## That's all for now

Let's build from here. What would you like to explore next?