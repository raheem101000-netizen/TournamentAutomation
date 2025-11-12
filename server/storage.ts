import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  tournaments,
  teams,
  matches,
  chatMessages,
  type Tournament,
  type Team,
  type Match,
  type ChatMessage,
  type InsertTournament,
  type InsertTeam,
  type InsertMatch,
  type InsertChatMessage,
} from "@shared/schema";

export interface IStorage {
  // Tournament operations
  createTournament(data: InsertTournament): Promise<Tournament>;
  getTournament(id: string): Promise<Tournament | undefined>;
  getAllTournaments(): Promise<Tournament[]>;
  updateTournament(id: string, data: Partial<Tournament>): Promise<Tournament | undefined>;

  // Team operations
  createTeam(data: InsertTeam): Promise<Team>;
  getTeam(id: string): Promise<Team | undefined>;
  getTeamsByTournament(tournamentId: string): Promise<Team[]>;
  updateTeam(id: string, data: Partial<Team>): Promise<Team | undefined>;

  // Match operations
  createMatch(data: InsertMatch): Promise<Match>;
  getMatch(id: string): Promise<Match | undefined>;
  getMatchesByTournament(tournamentId: string): Promise<Match[]>;
  updateMatch(id: string, data: Partial<Match>): Promise<Match | undefined>;

  // Chat operations
  createChatMessage(data: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesByMatch(matchId: string): Promise<ChatMessage[]>;
}

export class DatabaseStorage implements IStorage {
  // Tournament operations
  async createTournament(data: InsertTournament): Promise<Tournament> {
    const [tournament] = await db.insert(tournaments).values(data).returning();
    return tournament;
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament || undefined;
  }

  async getAllTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments).orderBy(tournaments.createdAt);
  }

  async updateTournament(id: string, data: Partial<Tournament>): Promise<Tournament | undefined> {
    const [tournament] = await db
      .update(tournaments)
      .set(data)
      .where(eq(tournaments.id, id))
      .returning();
    return tournament || undefined;
  }

  // Team operations
  async createTeam(data: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(data).returning();
    return team;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async getTeamsByTournament(tournamentId: string): Promise<Team[]> {
    return await db.select().from(teams).where(eq(teams.tournamentId, tournamentId));
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team | undefined> {
    const [team] = await db
      .update(teams)
      .set(data)
      .where(eq(teams.id, id))
      .returning();
    return team || undefined;
  }

  // Match operations
  async createMatch(data: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values(data).returning();
    return match;
  }

  async getMatch(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || undefined;
  }

  async getMatchesByTournament(tournamentId: string): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.tournamentId, tournamentId));
  }

  async updateMatch(id: string, data: Partial<Match>): Promise<Match | undefined> {
    const [match] = await db
      .update(matches)
      .set(data)
      .where(eq(matches.id, id))
      .returning();
    return match || undefined;
  }

  // Chat operations
  async createChatMessage(data: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(data).returning();
    return message;
  }

  async getChatMessagesByMatch(matchId: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.matchId, matchId));
  }
}

export const storage = new DatabaseStorage();
