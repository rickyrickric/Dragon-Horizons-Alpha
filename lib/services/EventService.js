/**
 * EventService
 * 
 * Business logic for event management.
 * Handles validation, creation, and retrieval of countdown timer events.
 */

export class EventService {
  constructor(eventRepo) {
    this.repo = eventRepo;
  }

  async getActiveEvents() {
    try {
      const { data, error } = await this.repo.getActive();
      if (error) {
        console.error('EventService.getActiveEvents error:', error);
        return { success: false, error: error.message || 'Failed to fetch events' };
      }
      return { success: true, data: data || [] };
    } catch (err) {
      console.error('EventService.getActiveEvents exception:', err);
      return { success: false, error: err.message };
    }
  }

  async getNextEvent() {
    try {
      const { data, error } = await this.repo.getNext();
      if (error) {
        console.error('EventService.getNextEvent error:', error);
        return { success: false, error: error.message || 'Failed to fetch next event' };
      }
      return { success: true, data };
    } catch (err) {
      console.error('EventService.getNextEvent exception:', err);
      return { success: false, error: err.message };
    }
  }

  async getEventById(id) {
    try {
      const { data, error } = await this.repo.getById(id);
      if (error) {
        console.error('EventService.getEventById error:', error);
        return { success: false, error: error.message || 'Event not found' };
      }
      return { success: true, data };
    } catch (err) {
      console.error('EventService.getEventById exception:', err);
      return { success: false, error: err.message };
    }
  }

  async createEvent(payload) {
    try {
      if (!payload.event_type?.trim()) return { success: false, error: 'Event type is required' };
      if (!['patch', 'world_reset', 'mystery'].includes(payload.event_type)) return { success: false, error: 'Invalid event type. Must be patch, world_reset, or mystery' };
      if (!payload.description?.trim()) return { success: false, error: 'Description is required' };
      if (payload.description.length > 500) return { success: false, error: 'Description is too long (max 500 characters)' };
      if (!payload.event_time) return { success: false, error: 'Event time is required' };

      const eventDate = new Date(payload.event_time);
      if (eventDate <= new Date()) return { success: false, error: 'Event time must be in the future' };

      // Default duration based on event type if not provided
      let duration = payload.duration?.trim() || '7-Day';
      if (payload.event_type === 'patch' && !payload.duration) {
        duration = '24-Hour'; // Patches typically last 24 hours
      }

      const normalizedPayload = { title: payload.title || null, event_type: payload.event_type.trim(), description: payload.description.trim(), event_time: eventDate.toISOString(), duration };
      const { data, error } = await this.repo.create(normalizedPayload);
      if (error) { console.error('Create event error:', error); return { success: false, error: 'Failed to create event' }; }
      return { success: true, data };
    } catch (err) { console.error('EventService.createEvent exception:', err); return { success: false, error: err.message }; }
  }

  async updateEvent(id, payload) {
    try {
      if (!id) return { success: false, error: 'Event ID is required' };
      const updates = {};
      if (payload.event_type !== undefined) { if (!['patch', 'world_reset', 'mystery'].includes(payload.event_type)) return { success: false, error: 'Invalid event type' }; updates.event_type = payload.event_type; }
      if (payload.description !== undefined) { if (!payload.description.trim()) return { success: false, error: 'Description cannot be empty' }; if (payload.description.length > 500) return { success: false, error: 'Description is too long (max 500 characters)' }; updates.description = payload.description.trim(); }
      if (payload.event_time !== undefined) { const eventDate = new Date(payload.event_time); if (eventDate <= new Date()) return { success: false, error: 'Event time must be in the future' }; updates.event_time = eventDate.toISOString(); }
      if (payload.duration !== undefined) { updates.duration = payload.duration.trim(); }
      if (Object.keys(updates).length === 0) return { success: false, error: 'No updates provided' };
      const { data, error } = await this.repo.update(id, updates);
      if (error || !data) { console.error('Update event error:', error); return { success: false, error: 'Failed to update event' }; }
      return { success: true, data };
    } catch (err) { console.error('EventService.updateEvent exception:', err); return { success: false, error: err.message }; }
  }

  async deleteEvent(id) {
    try {
      if (!id) return { success: false, error: 'Event ID is required' };
      const { error } = await this.repo.delete(id);
      if (error) { console.error('Delete event error:', error); return { success: false, error: 'Failed to delete event' }; }
      return { success: true };
    } catch (err) { console.error('EventService.deleteEvent exception:', err); return { success: false, error: err.message }; }
  }
}
