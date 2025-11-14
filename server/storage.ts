import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  tournaments,
  teams,
  matches,
  chatMessages,
  registrationConfigs,
  registrationSteps,
  registrationFields,
  registrations,
  registrationResponses,
  servers,
  messageThreads,
  notifications,
  type Tournament,
  type Team,
  type Match,
  type ChatMessage,
  type RegistrationConfig,
  type RegistrationStep,
  type RegistrationField,
  type Registration,
  type RegistrationResponse,
  type Server,
  type MessageThread,
  type Notification,
  type InsertTournament,
  type InsertTeam,
  type InsertMatch,
  type InsertChatMessage,
  type InsertRegistrationConfig,
  type InsertRegistrationStep,
  type InsertRegistrationField,
  type InsertRegistration,
  type InsertRegistrationResponse,
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

  // Registration operations
  createRegistrationConfig(data: InsertRegistrationConfig): Promise<RegistrationConfig>;
  getRegistrationConfigByTournament(tournamentId: string): Promise<RegistrationConfig | undefined>;
  updateRegistrationConfig(id: string, data: Partial<RegistrationConfig>): Promise<RegistrationConfig | undefined>;
  deleteRegistrationConfig(configId: string): Promise<void>;
  
  createRegistrationStep(data: InsertRegistrationStep): Promise<RegistrationStep>;
  getStepsByConfig(configId: string): Promise<RegistrationStep[]>;
  
  createRegistrationField(data: InsertRegistrationField): Promise<RegistrationField>;
  getFieldsByStep(stepId: string): Promise<RegistrationField[]>;
  
  createRegistration(data: InsertRegistration): Promise<Registration>;
  getRegistration(id: string): Promise<Registration | undefined>;
  getRegistrationsByTournament(tournamentId: string): Promise<Registration[]>;
  updateRegistration(id: string, data: Partial<Registration>): Promise<Registration | undefined>;
  
  createRegistrationResponse(data: InsertRegistrationResponse): Promise<RegistrationResponse>;
  getResponsesByRegistration(registrationId: string): Promise<RegistrationResponse[]>;

  // Mobile preview operations
  getAllServers(): Promise<Server[]>;
  getAllMessageThreads(): Promise<MessageThread[]>;
  getAllNotifications(): Promise<Notification[]>;
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

  // Registration operations
  async createRegistrationConfig(data: InsertRegistrationConfig): Promise<RegistrationConfig> {
    const [config] = await db.insert(registrationConfigs).values(data).returning();
    return config;
  }

  async getRegistrationConfigByTournament(tournamentId: string): Promise<RegistrationConfig | undefined> {
    const [config] = await db.select().from(registrationConfigs).where(eq(registrationConfigs.tournamentId, tournamentId));
    return config || undefined;
  }

  async updateRegistrationConfig(id: string, data: Partial<RegistrationConfig>): Promise<RegistrationConfig | undefined> {
    const [config] = await db
      .update(registrationConfigs)
      .set(data)
      .where(eq(registrationConfigs.id, id))
      .returning();
    return config || undefined;
  }

  async deleteRegistrationConfig(configId: string): Promise<void> {
    await db.transaction(async (tx) => {
      const steps = await tx
        .select()
        .from(registrationSteps)
        .where(eq(registrationSteps.configId, configId));

      if (steps.length > 0) {
        const stepIds = steps.map(s => s.id);
        
        const allFields: { id: string }[] = [];
        for (const stepId of stepIds) {
          const fields = await tx
            .select({ id: registrationFields.id })
            .from(registrationFields)
            .where(eq(registrationFields.stepId, stepId));
          allFields.push(...fields);
        }

        if (allFields.length > 0) {
          const fieldIds = allFields.map(f => f.id);
          
          for (const fieldId of fieldIds) {
            await tx
              .delete(registrationResponses)
              .where(eq(registrationResponses.fieldId, fieldId));
          }
        }

        for (const stepId of stepIds) {
          await tx
            .delete(registrationFields)
            .where(eq(registrationFields.stepId, stepId));
        }

        await tx
          .delete(registrationSteps)
          .where(eq(registrationSteps.configId, configId));
      }

      await tx
        .delete(registrationConfigs)
        .where(eq(registrationConfigs.id, configId));
    });
  }

  async createRegistrationStep(data: InsertRegistrationStep): Promise<RegistrationStep> {
    const [step] = await db.insert(registrationSteps).values(data).returning();
    return step;
  }

  async getStepsByConfig(configId: string): Promise<RegistrationStep[]> {
    return await db.select().from(registrationSteps).where(eq(registrationSteps.configId, configId));
  }

  async createRegistrationField(data: InsertRegistrationField): Promise<RegistrationField> {
    const [field] = await db.insert(registrationFields).values(data).returning();
    return field;
  }

  async getFieldsByStep(stepId: string): Promise<RegistrationField[]> {
    return await db.select().from(registrationFields).where(eq(registrationFields.stepId, stepId));
  }

  async createRegistration(data: InsertRegistration): Promise<Registration> {
    const [registration] = await db.insert(registrations).values(data).returning();
    return registration;
  }

  async getRegistration(id: string): Promise<Registration | undefined> {
    const [registration] = await db.select().from(registrations).where(eq(registrations.id, id));
    return registration || undefined;
  }

  async getRegistrationsByTournament(tournamentId: string): Promise<Registration[]> {
    return await db.select().from(registrations).where(eq(registrations.tournamentId, tournamentId));
  }

  async updateRegistration(id: string, data: Partial<Registration>): Promise<Registration | undefined> {
    const [registration] = await db
      .update(registrations)
      .set(data)
      .where(eq(registrations.id, id))
      .returning();
    return registration || undefined;
  }

  async createRegistrationResponse(data: InsertRegistrationResponse): Promise<RegistrationResponse> {
    const [response] = await db.insert(registrationResponses).values(data).returning();
    return response;
  }

  async getResponsesByRegistration(registrationId: string): Promise<RegistrationResponse[]> {
    return await db.select().from(registrationResponses).where(eq(registrationResponses.registrationId, registrationId));
  }

  // Mobile preview operations
  async getAllServers(): Promise<Server[]> {
    return await db.select().from(servers).orderBy(servers.createdAt);
  }

  async getAllMessageThreads(): Promise<MessageThread[]> {
    return await db.select().from(messageThreads).orderBy(messageThreads.lastMessageTime);
  }

  async getAllNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications).orderBy(notifications.timestamp);
  }
}

export const storage = new DatabaseStorage();
