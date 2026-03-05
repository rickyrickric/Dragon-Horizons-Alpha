/**
 * DatabaseFactory
 * 
 * Factory pattern implementation for creating database repository instances.
 * Supports multiple backends: Supabase (default) and Firestore (optional).
 * 
 * Centralizes all repository instantiation and manages backend selection.
 */

import { SupabaseApplicationRepository } from '../repositories/SupabaseApplicationRepository.js';
import { SupabaseConfigRepository } from '../repositories/SupabaseConfigRepository.js';
import { SupabaseAdminKeyRepository } from '../repositories/SupabaseAdminKeyRepository.js';
import { SupabaseModRecommendationRepository } from '../repositories/SupabaseModRecommendationRepository.js';

// TODO: When Firestore implementations are ready, import them:
// import { FirestoreApplicationRepository } from '../repositories/FirestoreApplicationRepository.js';
// import { FirestoreConfigRepository } from '../repositories/FirestoreConfigRepository.js';
// import { FirestoreAdminKeyRepository } from '../repositories/FirestoreAdminKeyRepository.js';
// import { FirestoreModRecommendationRepository } from '../repositories/FirestoreModRecommendationRepository.js';

class DatabaseFactory {
  constructor() {
    // Determine which backend to use
    this.useFirebase = (process.env.USE_FIREBASE === '1' || process.env.USE_FIREBASE === 'true');
    
    // Cache instances for reuse
    this._appRepository = null;
    this._configRepository = null;
    this._adminKeyRepository = null;
    this._modRecRepository = null;
  }

  /**
   * Get or create ApplicationRepository instance
   * @returns {ApplicationRepository}
   */
  getApplicationRepository() {
    if (!this._appRepository) {
      if (this.useFirebase) {
        // TODO: return new FirestoreApplicationRepository();
        throw new Error('Firestore backend not yet implemented');
      } else {
        this._appRepository = new SupabaseApplicationRepository();
      }
    }
    return this._appRepository;
  }

  /**
   * Get or create ConfigRepository instance
   * @returns {ConfigRepository}
   */
  getConfigRepository() {
    if (!this._configRepository) {
      if (this.useFirebase) {
        // TODO: return new FirestoreConfigRepository();
        throw new Error('Firestore backend not yet implemented');
      } else {
        this._configRepository = new SupabaseConfigRepository();
      }
    }
    return this._configRepository;
  }

  /**
   * Get or create AdminKeyRepository instance
   * @returns {AdminKeyRepository}
   */
  getAdminKeyRepository() {
    if (!this._adminKeyRepository) {
      if (this.useFirebase) {
        // TODO: return new FirestoreAdminKeyRepository();
        throw new Error('Firestore backend not yet implemented');
      } else {
        this._adminKeyRepository = new SupabaseAdminKeyRepository();
      }
    }
    return this._adminKeyRepository;
  }

  /**
   * Get or create ModRecommendationRepository instance
   * @returns {ModRecommendationRepository}
   */
  getModRecommendationRepository() {
    if (!this._modRecRepository) {
      if (this.useFirebase) {
        // TODO: return new FirestoreModRecommendationRepository();
        throw new Error('Firestore backend not yet implemented');
      } else {
        this._modRecRepository = new SupabaseModRecommendationRepository();
      }
    }
    return this._modRecRepository;
  }

  /**
   * Get the active backend name
   * @returns {string} 'Supabase' or 'Firestore'
   */
  getBackendName() {
    return this.useFirebase ? 'Firestore' : 'Supabase';
  }
}

// Export singleton instance
export const databaseFactory = new DatabaseFactory();

// Also export the class for testing/advanced usage
export { DatabaseFactory };
