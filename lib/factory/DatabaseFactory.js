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
import { SupabaseEventRepository } from '../repositories/SupabaseEventRepository.js';

class DatabaseFactory {
  constructor() {
    this.useFirebase = (process.env.USE_FIREBASE === '1' || process.env.USE_FIREBASE === 'true');
    this._appRepository = null;
    this._configRepository = null;
    this._adminKeyRepository = null;
    this._modRecRepository = null;
    this._eventRepository = null;
  }

  getApplicationRepository() {
    if (!this._appRepository) {
      if (this.useFirebase) {
        throw new Error('Firestore backend not yet implemented');
      } else {
        this._appRepository = new SupabaseApplicationRepository();
      }
    }
    return this._appRepository;
  }

  getConfigRepository() {
    if (!this._configRepository) {
      if (this.useFirebase) {
        throw new Error('Firestore backend not yet implemented');
      } else {
        this._configRepository = new SupabaseConfigRepository();
      }
    }
    return this._configRepository;
  }

  getAdminKeyRepository() {
    if (!this._adminKeyRepository) {
      if (this.useFirebase) {
        throw new Error('Firestore backend not yet implemented');
      } else {
        this._adminKeyRepository = new SupabaseAdminKeyRepository();
      }
    }
    return this._adminKeyRepository;
  }

  getModRecommendationRepository() {
    if (!this._modRecRepository) {
      if (this.useFirebase) {
        throw new Error('Firestore backend not yet implemented');
      } else {
        this._modRecRepository = new SupabaseModRecommendationRepository();
      }
    }
    return this._modRecRepository;
  }

  getEventRepository() {
    if (!this._eventRepository) {
      if (this.useFirebase) {
        throw new Error('Firestore backend not yet implemented');
      } else {
        this._eventRepository = new SupabaseEventRepository();
      }
    }
    return this._eventRepository;
  }

  getBackendName() {
    return this.useFirebase ? 'Firestore' : 'Supabase';
  }
}

export const databaseFactory = new DatabaseFactory();
export { DatabaseFactory };
