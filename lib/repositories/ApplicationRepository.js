/**
 * ApplicationRepository Interface
 * 
 * Defines contract for application data access operations.
 */
export class ApplicationRepository {
  async insert(payload) { throw new Error('Not implemented'); }
  async findExisting(aternos_username) { throw new Error('Not implemented'); }
  async getAll(status) { throw new Error('Not implemented'); }
  async getById(id) { throw new Error('Not implemented'); }
  async update(id, updates) { throw new Error('Not implemented'); }
  async delete(id) { throw new Error('Not implemented'); }
}
