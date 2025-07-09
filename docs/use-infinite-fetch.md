# useInfiniteFetch Hook

A generic hook for implementing infinite scrolling with cursor-based pagination.

## Basic Usage

```typescript
import { useInfiniteFetch } from '@lens2/hooks/use-infinite-fetch';

const MyComponent = () => {
  const {
    flatData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    refetch,
  } = useInfiniteFetch({
    queryKey: 'users',
    endpoint: '/api/users',
    search: searchQuery,
    filters: { active: true },
    perPage: 20,
  });

  return (
    <div>
      {flatData.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
};
```

## With Custom Fetch Function

```typescript
const customFetchFn = async ({ pageParam, endpoint, headers, body }) => {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...headers,
    },
    body: JSON.stringify({
      ...body,
      pagination: {
        type: 'cursor',
        per_page: body.perPage,
        cursor: pageParam,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
};

const { flatData } = useInfiniteFetch({
  queryKey: 'products',
  endpoint: '/api/products',
  fetchFn: customFetchFn,
  filters: { category: 'electronics' },
});
```

## With Infinite Scroll

```typescript
import { useRef } from 'react';
import { useFetchMoreOnScroll } from '@lens2/hooks/use-fetch-more-on-scroll';

const InfiniteScrollList = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { flatData, fetchNextPage, hasNextPage, isFetching } = useInfiniteFetch({
    queryKey: 'items',
    endpoint: '/api/items',
  });

  const { fetchMoreOnBottomReached } = useFetchMoreOnScroll({
    containerRef,
    fetchNextPage,
    isFetching,
    hasNextPage,
  });

  return (
    <div
      ref={containerRef}
      style={{ height: '400px', overflow: 'auto' }}
      onScroll={(e) => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
    >
      {flatData.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      {isFetching && <div>Loading more...</div>}
    </div>
  );
};
```

## API

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `queryKey` | `string \| array` | required | Unique key for the query |
| `endpoint` | `string` | required | API endpoint URL |
| `headers` | `object` | `{}` | Additional headers |
| `body` | `object` | `{}` | Additional body parameters |
| `filters` | `object` | `{}` | Filter parameters |
| `search` | `string` | `''` | Search query |
| `globalContext` | `object` | `{}` | Global context data |
| `perPage` | `number` | `10` | Items per page |
| `fetchFn` | `function` | defaultFetchFn | Custom fetch function |
| `keepPreviousData` | `boolean` | `true` | Keep previous data while fetching |
| `queryOptions` | `object` | `{}` | Additional TanStack Query options |

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `data` | `object` | Raw paginated data |
| `flatData` | `array` | Flattened array of all items |
| `totalCount` | `number \| null` | Total count if available |
| `fetchNextPage` | `function` | Function to fetch next page |
| `fetchPreviousPage` | `function` | Function to fetch previous page |
| `hasNextPage` | `boolean` | Whether more pages exist |
| `hasPreviousPage` | `boolean` | Whether previous pages exist |
| `isFetching` | `boolean` | Currently fetching data |
| `isLoading` | `boolean` | Initial loading state |
| `isError` | `boolean` | Error state |
| `error` | `Error \| null` | Error object if any |
| `refetch` | `function` | Function to refetch data |

## Expected Response Format

The hook expects responses in this format:

```json
{
  "data": [...],
  "meta": {
    "next_cursor": "abc123",
    "prev_cursor": null,
    "total": 150
  }
}
```