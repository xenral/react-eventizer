/**
 * EventMap interface to be extended by users of the library.
 * Keys are event names and values are payload types.
 */
export interface EventMap {}

/**
 * Core event bus class that manages subscriptions and event emissions.
 * 
 * @template EM - Event map type that extends Record<string, any>
 */
export class Eventizer<EM extends Record<string, any>> {
  /**
   * Internal storage for event subscribers.
   * Maps event names to arrays of callback functions.
   */
  private subscribers: { [K in keyof EM]?: Array<(payload: EM[K]) => void> } = {};

  /**
   * Subscribe to an event.
   * 
   * @param event - The event name to subscribe to
   * @param callback - The callback function to be called when the event is emitted
   * @returns A function to unsubscribe the callback
   */
  on<K extends keyof EM>(event: K, callback: (payload: EM[K]) => void): () => void {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event]!.push(callback);
    
    // Return an unsubscribe function for convenience
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event.
   * 
   * @param event - The event name to unsubscribe from
   * @param callback - The callback function to remove
   */
  off<K extends keyof EM>(event: K, callback: (payload: EM[K]) => void): void {
    if (!this.subscribers[event]) return;
    
    this.subscribers[event] = this.subscribers[event]?.filter(cb => cb !== callback);
    
    // Clean up empty subscriber arrays
    if (this.subscribers[event]?.length === 0) {
      delete this.subscribers[event];
    }
  }

  /**
   * Emit an event with a payload.
   * 
   * @param event - The event name to emit
   * @param payload - The payload to pass to subscribers
   */
  emit<K extends keyof EM>(event: K, payload: EM[K]): void {
    this.subscribers[event]?.forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        console.error(`Error in event handler for ${String(event)}:`, error);
      }
    });
  }

  /**
   * Get the number of subscribers for a specific event.
   * Useful for debugging and testing.
   * 
   * @param event - The event name to check
   * @returns The number of subscribers
   */
  subscriberCount<K extends keyof EM>(event: K): number {
    return this.subscribers[event]?.length || 0;
  }

  /**
   * Remove all subscribers for a specific event.
   * 
   * @param event - The event name to clear subscribers for
   */
  clearEvent<K extends keyof EM>(event: K): void {
    delete this.subscribers[event];
  }

  /**
   * Remove all subscribers for all events.
   */
  clearAll(): void {
    this.subscribers = {};
  }
} 