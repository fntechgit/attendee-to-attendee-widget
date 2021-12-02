import AccessRepository from '../repository/accessRepository'
import SupabaseClientBuilder from './supabaseClientBuilder'

export default class AccessRepositoryBuilder {
  static repo

  static getRepository(supabaseUrl, supabaseKey, subscribeToRealTime) {
    if (!this.repo) {
      this.repo = new AccessRepository(
        SupabaseClientBuilder.getClient(supabaseUrl, supabaseKey),
        subscribeToRealTime
      )
    }
    return this.repo
  }
}
