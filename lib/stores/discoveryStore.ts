import { LocalStorage, StorageKeys } from '../storage';
import type { TournamentPoster } from '@shared/types';

export class DiscoveryStore {
  static getAllTournaments(): TournamentPoster[] {
    return LocalStorage.getArray<TournamentPoster>(StorageKeys.TOURNAMENTS);
  }

  static getTournamentById(id: string): TournamentPoster | null {
    const tournaments = this.getAllTournaments();
    return tournaments.find(t => t.id === id) || null;
  }

  static getTournamentsByStatus(status: TournamentPoster['status']): TournamentPoster[] {
    const all = this.getAllTournaments();
    return all.filter(t => t.status === status);
  }

  static getTournamentsByGame(game: string): TournamentPoster[] {
    const all = this.getAllTournaments();
    return all.filter(t => t.game.toLowerCase().includes(game.toLowerCase()));
  }

  static searchTournaments(query: string): TournamentPoster[] {
    const all = this.getAllTournaments();
    const lowerQuery = query.toLowerCase();
    return all.filter(
      t =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.game.toLowerCase().includes(lowerQuery) ||
        t.organizerName.toLowerCase().includes(lowerQuery)
    );
  }
}
