/**
 * EventRepository - Abstract interface
 * 
 * Defines contract for event data access operations.
 * Manages upcoming events (patches, world resets, mystery events).
 */
export class EventRepository {
  /**
   * Get all active events
   * @returns {Promise<{data: Event[], error: ?Object}>}
   */
  async getActive() {
    throw new Error('Not implemented');
  }

  /**
   * Get next upcoming event
   * @returns {Promise<{data: Event?, error: ?Object}>}
   */
  async getNext() {
    throw new Error('Not implemented');
  }

  /**
   * Create new event
   * @param {Object} payload
   * @returns {Promise<{data: Event, error: ?Object}>}
   */
  async create(payload) {
    throw new Error('Not implemented');
  }

  /**
   * Update event
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<{data: Event, error: ?Object}>}
   */
  async update(id, updates) {
    throw new Error('Not implemented');
  }

  /**
   * Delete event
   * @param {string} id
   * @returns {Promise<{error: ?Object}>}
   */
  async delete(id) {
    throw new Error('Not implemented');
  }
}
