# react-eventizer

[![npm version](https://img.shields.io/npm/v/react-eventizer.svg?style=flat-square)](https://www.npmjs.com/package/react-eventizer)
[![npm downloads](https://img.shields.io/npm/dm/react-eventizer.svg?style=flat-square)](https://www.npmjs.com/package/react-eventizer)

A lightweight, zero-dependency React event bus with full TypeScript support. Enables decoupled component communication using a pub/sub model.

- **Package**: [`react-eventizer` on npm](https://www.npmjs.com/package/react-eventizer)
- **Latest version**: ![npm](https://img.shields.io/npm/v/react-eventizer.svg)

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
// `BaseEventMap` is intentionally empty so you can define your own events.
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
  // ✅ payload is automatically typed as { username: string; id: number }
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
  // ✅ emitLogin is automatically typed as (payload: { username: string; id: number }) => void
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

## Type Safety

One of the key benefits of `react-eventizer` is **automatic type inference**. Once you define your `EventMap` and pass it to the `EventizerProvider`, all hooks (`useEmitter` and `useSubscribe`) automatically infer the correct payload types without requiring you to specify generics again.

```tsx
// ✅ Simple and type-safe - no generics needed!
const emitLogin = useEmitter('user:login');
emitLogin({ username: 'john', id: 123 }); // ✅ Correct
emitLogin({ username: 'john' }); // ❌ TypeScript error: Property 'id' is missing

useSubscribe('user:login', (payload) => {
  // payload is automatically typed as { username: string; id: number }
  console.log(payload.username); // ✅ TypeScript knows this is a string
  console.log(payload.id); // ✅ TypeScript knows this is a number
});
```

This provides an excellent developer experience - you define your event types once, and TypeScript handles the rest!

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

## When to Use an Event Bus vs. State Management

While state management libraries like Redux, Zustand, or Context API are powerful tools for managing application state, an event bus offers distinct advantages in certain scenarios. Here are situations where react-eventizer shines:

### 1. Cross-Component Communication Without Prop Drilling

**Problem**: Components need to communicate across different parts of the component tree without direct parent-child relationships.

**Solution**: An event bus allows any component to emit events that can be received by any other component, regardless of their position in the component tree.

```tsx
// In a deeply nested component
const DeleteButton = () => {
  const emitDelete = useEmitter('item:delete');
  return <button onClick={() => emitDelete(itemId)}>Delete</button>;
};

// In a completely different part of the app
const Notifications = () => {
  useSubscribe('item:delete', (itemId) => {
    showNotification(`Item ${itemId} deleted successfully`);
  });
  // ...
};
```

### 2. Decoupled Component Architecture

**Problem**: Tightly coupled components make code harder to maintain and test.

**Solution**: An event bus promotes loose coupling by allowing components to communicate without direct dependencies.

### 3. Notification and Alert Systems

**Problem**: Notifications need to be triggered from anywhere in the app but displayed in a central component.

**Solution**: Components can emit notification events that are handled by a central notification manager.

```tsx
// Any component can trigger a notification
const saveData = async () => {
  try {
    await api.save(data);
    emitNotification({ type: 'success', message: 'Data saved successfully' });
  } catch (error) {
    emitNotification({ type: 'error', message: 'Failed to save data' });
  }
};

// Notification component listens for all notifications
const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  
  useSubscribe('notification:new', (notification) => {
    setNotifications(prev => [...prev, notification]);
  });
  
  // Render notifications...
};
```

### 4. Global UI State Changes

**Problem**: UI changes like theme switching or sidebar toggling need to affect multiple components.

**Solution**: Emit a single event that all interested components can subscribe to.

### 5. Handling Asynchronous Events

**Problem**: Managing asynchronous events like WebSocket messages or long-polling updates.

**Solution**: Emit events when async data arrives, allowing any component to react accordingly.

```tsx
// WebSocket service
socket.onMessage((data) => {
  eventBus.emit('socket:message', data);
});

// Any component can listen
const LiveUpdates = () => {
  useSubscribe('socket:message', (data) => {
    // Update component based on socket data
  });
  // ...
};
```

### 6. When to Stick with State Management

While an event bus is powerful, traditional state management might be better when:

- You need to persist and access state across the entire application
- You require time-travel debugging or state snapshots
- Your application has complex state transitions and validations
- You need middleware for side effects (though you can build this with an event bus too)

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
// `BaseEventMap` has no predefined events.
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