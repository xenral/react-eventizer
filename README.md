# react-eventizer

A lightweight, zero-dependency React event bus with full TypeScript support. Enables decoupled component communication using a pub/sub model.

## Features

- 🔄 **Simple Pub/Sub API**: Easy-to-use methods for subscribing to and emitting events
- 🔒 **Type-Safe**: Full TypeScript support with generics to enforce event types and payloads
- ⚛️ **React Integration**: Seamless integration with React via Context and custom hooks
- 🪶 **Lightweight**: Zero external dependencies, minimal footprint
- 🧩 **Decoupled Communication**: Communicate between components without prop drilling or complex state management

## Installation

```bash
npm install react-eventizer
# or
yarn add react-eventizer
```

## Quick Start

### 1. Define your event map

```typescript
// events.ts
import { EventMap as BaseEventMap } from 'react-eventizer';

export interface EventMap extends BaseEventMap {
  'user:login': { username: string; id: number };
  'notification:new': { message: string; type: 'info' | 'warning' | 'error' };
  'theme:change': 'light' | 'dark';
  'modal:close': void;
}
```

### 2. Set up the provider

```tsx
// App.tsx
import React from 'react';
import { Eventizer, EventizerProvider } from 'react-eventizer';
import { EventMap } from './events';

const App: React.FC = () => {
  // Create an event bus instance
  const eventBus = React.useMemo(() => new Eventizer<EventMap>(), []);
  
  return (
    <EventizerProvider bus={eventBus}>
      <YourApp />
    </EventizerProvider>
  );
};
```

### 3. Subscribe to events

```tsx
// UserProfile.tsx
import React, { useState } from 'react';
import { useSubscribe } from 'react-eventizer';

const UserProfile: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  
  // Subscribe to the user:login event
  useSubscribe('user:login', (payload) => {
    setUsername(payload.username);
  });
  
  return (
    <div>
      {username ? `Welcome, ${username}!` : 'Please log in'}
    </div>
  );
};
```

### 4. Emit events

```tsx
// LoginForm.tsx
import React, { useState } from 'react';
import { useEmitter } from 'react-eventizer';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const emitLogin = useEmitter('user:login');
  
  const handleLogin = () => {
    // Emit the user:login event with payload
    emitLogin({ username, id: 123 });
  };
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

## API Reference

### Core

#### `Eventizer<EM>`

The main event bus class.

```typescript
const eventBus = new Eventizer<EventMap>();
```

Methods:

- `on<K>(event: K, callback: (payload: EM[K]) => void): () => void` - Subscribe to an event
- `off<K>(event: K, callback: (payload: EM[K]) => void): void` - Unsubscribe from an event
- `emit<K>(event: K, payload: EM[K]): void` - Emit an event with payload
- `subscriberCount<K>(event: K): number` - Get the number of subscribers for an event
- `clearEvent<K>(event: K): void` - Remove all subscribers for an event
- `clearAll(): void` - Remove all subscribers for all events

### React Integration

#### `EventizerProvider`

React context provider for the event bus.

```tsx
<EventizerProvider bus={eventBus}>
  {children}
</EventizerProvider>
```

#### `useEventizer()`

Hook to access the event bus instance.

```typescript
const eventBus = useEventizer();
```

#### `useSubscribe<K>(event: K, callback: (payload: EventMap[K]) => void, deps?: any[])`

Hook to subscribe to an event and automatically unsubscribe on component unmount.

```typescript
useSubscribe('user:login', (payload) => {
  console.log(`User logged in: ${payload.username}`);
});
```

#### `useEmitter<K>(event: K): (payload: EventMap[K]) => void`

Hook to create an event emitter function.

```typescript
const emitLogin = useEmitter('user:login');
// Later...
emitLogin({ username: 'john', id: 123 });
```

## Advanced Usage

### Custom Event Maps

You can extend the base `EventMap` interface to add your own events:

```typescript
import { EventMap as BaseEventMap } from 'react-eventizer';

export interface EventMap extends BaseEventMap {
  'cart:add': { productId: string; quantity: number };
  'cart:remove': { productId: string };
  'cart:clear': void;
}
```

### Using with Multiple Event Buses

For more complex applications, you might want to use multiple event buses:

```tsx
// Create specialized event buses
const userEventBus = new Eventizer<UserEventMap>();
const uiEventBus = new Eventizer<UIEventMap>();

// Provide them at different levels of your component tree
<EventizerProvider bus={userEventBus}>
  <UserRelatedComponents />
  
  <EventizerProvider bus={uiEventBus}>
    <UIComponents />
  </EventizerProvider>
</EventizerProvider>
```

## Best Practices

1. **Define Event Types**: Always define your event types in a central location for consistency.
2. **Use Namespaces**: Prefix your events with namespaces (e.g., `user:`, `ui:`) to avoid collisions.
3. **Cleanup**: The `useSubscribe` hook handles cleanup automatically, but if you use `on()` directly, remember to unsubscribe.
4. **Performance**: Avoid emitting events in tight loops or render functions.

## License

MIT 