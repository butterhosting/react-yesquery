# React Yesquery: Simple loading state management

This is a lightweight and simple library for managing loading states in React.

## Installation

```
npm install react-yesquery
```

## Basic Usage

```tsx
export function Dashboard() {
  
  // 1 - call the hook with a query function
  const { data, error, ...hook } = useYesQuery({
    queryFn: () => fetch("/users").then(res => res.json())
  });

  // 2 - Optionally, use imperative functions for reloading and getting / setting state directly
  const imperativeReload = () => hook.reload();
  const imperativeGetData = () => hook.getData();
  const imperativeSetData = () => hook.setData([{ name: "Bob" }, { name: "Alice" }]);

  // 3 - Render your component, based on the data or errors
  if (!data && !error) {
    return <div>Loading</div>;
  }
  if (error) {
    return <div>Something went wrong: {error.message}</div>
  }
  return (
    <ul>
      {data.map(user => (
        <li>{user.name}</li>>
      ))}
    </ul>
  );
  
}
```
