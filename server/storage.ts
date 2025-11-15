import { eq, and } from "drizzle-orm";
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
  channels,
  messageThreads,
  notifications,
  posterTemplates,
  posterTemplateTags,
  users,
  achievements,
  teamProfiles,
  teamMembers,
  serverMembers,
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
  type Channel,
  type MessageThread,
  type Notification,
  type PosterTemplate,
  type PosterTemplateTag,
  type User,
  type Achievement,
  type TeamProfile,
  type TeamMember,
  type ServerMember,
  type InsertTournament,
  type InsertTeam,
  type InsertMatch,
  type InsertChatMessage,
  type InsertRegistrationConfig,
  type InsertRegistrationStep,
  type InsertRegistrationField,
  type InsertRegistration,
  type InsertRegistrationResponse,
  type InsertServer,
  type InsertChannel,
  type InsertPosterTemplate,
  type InsertPosterTemplateTag,
  type InsertUser,
  type InsertAchievement,
  type InsertTeamProfile,
  type InsertTeamMember,
  type InsertServerMember,
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

  // Server operations
  createServer(data: InsertServer): Promise<Server>;
  getAllServers(): Promise<Server[]>;
  getServer(id: string): Promise<Server | undefined>;
  
  // Channel operations
  createChannel(data: InsertChannel): Promise<Channel>;
  getChannelsByServer(serverId: string): Promise<Channel[]>;
  getChannel(id: string): Promise<Channel | undefined>;
  
  // Mobile preview operations
  getAllMessageThreads(): Promise<MessageThread[]>;
  getAllNotifications(): Promise<Notification[]>;

  // Poster template operations
  createPosterTemplate(data: InsertPosterTemplate): Promise<PosterTemplate>;
  getAllPosterTemplates(): Promise<PosterTemplate[]>;
  getActivePosterTemplates(): Promise<PosterTemplate[]>;
  getPosterTemplate(id: string): Promise<PosterTemplate | undefined>;
  updatePosterTemplate(id: string, data: Partial<PosterTemplate>): Promise<PosterTemplate | undefined>;
  deletePosterTemplate(id: string): Promise<void>;
  
  createPosterTemplateTag(data: InsertPosterTemplateTag): Promise<PosterTemplateTag>;
  getTagsByTemplate(templateId: string): Promise<PosterTemplateTag[]>;
  deleteTagsByTemplate(templateId: string): Promise<void>;

  // User operations
  createUser(data: InsertUser): Promise<User>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Achievement operations
  createAchievement(data: InsertAchievement): Promise<Achievement>;
  getAchievementsByUser(userId: string): Promise<Achievement[]>;

  // Team profile operations
  createTeamProfile(data: InsertTeamProfile): Promise<TeamProfile>;
  getTeamProfile(id: string): Promise<TeamProfile | undefined>;
  getTeamProfilesByOwner(ownerId: string): Promise<TeamProfile[]>;
  updateTeamProfile(id: string, data: Partial<TeamProfile>): Promise<TeamProfile | undefined>;
  deleteTeamProfile(id: string): Promise<void>;

  // Team member operations
  createTeamMember(data: InsertTeamMember): Promise<TeamMember>;
  getMembersByTeam(teamId: string): Promise<TeamMember[]>;
  deleteMemberFromTeam(teamId: string, userId: string): Promise<void>;

  // Server member operations
  createServerMember(data: InsertServerMember): Promise<ServerMember>;
  getMembersByServer(serverId: string): Promise<ServerMember[]>;
  deleteMemberFromServer(serverId: string, userId: string): Promise<void>;
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

  // Server operations
  async createServer(data: InsertServer): Promise<Server> {
    const [server] = await db.insert(servers).values(data).returning();
    return server;
  }

  async getAllServers(): Promise<Server[]> {
    return await db.select().from(servers).orderBy(servers.createdAt);
  }

  async getServer(id: string): Promise<Server | undefined> {
    const [server] = await db.select().from(servers).where(eq(servers.id, id));
    return server || undefined;
  }

  // Channel operations
  async createChannel(data: InsertChannel): Promise<Channel> {
    const [channel] = await db.insert(channels).values(data).returning();
    return channel;
  }

  async getChannelsByServer(serverId: string): Promise<Channel[]> {
    return await db.select().from(channels).where(eq(channels.serverId, serverId)).orderBy(channels.position);
  }

  async getChannel(id: string): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel || undefined;
  }

  // Mobile preview operations
  async getAllMessageThreads(): Promise<MessageThread[]> {
    return await db.select().from(messageThreads).orderBy(messageThreads.lastMessageTime);
  }

  async getAllNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications).orderBy(notifications.timestamp);
  }

  // Poster template operations
  async createPosterTemplate(data: InsertPosterTemplate): Promise<PosterTemplate> {
    const [template] = await db.insert(posterTemplates).values(data).returning();
    return template;
  }

  async getAllPosterTemplates(): Promise<PosterTemplate[]> {
    return await db.select().from(posterTemplates).orderBy(posterTemplates.displayOrder);
  }

  async getActivePosterTemplates(): Promise<PosterTemplate[]> {
    return await db.select().from(posterTemplates)
      .where(eq(posterTemplates.isActive, 1))
      .orderBy(posterTemplates.displayOrder);
  }

  async getPosterTemplate(id: string): Promise<PosterTemplate | undefined> {
    const [template] = await db.select().from(posterTemplates).where(eq(posterTemplates.id, id));
    return template || undefined;
  }

  async updatePosterTemplate(id: string, data: Partial<PosterTemplate>): Promise<PosterTemplate | undefined> {
    const [template] = await db
      .update(posterTemplates)
      .set(data)
      .where(eq(posterTemplates.id, id))
      .returning();
    return template || undefined;
  }

  async deletePosterTemplate(id: string): Promise<void> {
    await this.deleteTagsByTemplate(id);
    await db.delete(posterTemplates).where(eq(posterTemplates.id, id));
  }

  async createPosterTemplateTag(data: InsertPosterTemplateTag): Promise<PosterTemplateTag> {
    const [tag] = await db.insert(posterTemplateTags).values(data).returning();
    return tag;
  }

  async getTagsByTemplate(templateId: string): Promise<PosterTemplateTag[]> {
    return await db.select().from(posterTemplateTags).where(eq(posterTemplateTags.templateId, templateId));
  }

  async deleteTagsByTemplate(templateId: string): Promise<void> {
    await db.delete(posterTemplateTags).where(eq(posterTemplateTags.templateId, templateId));
  }

  // User operations
  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Achievement operations
  async createAchievement(data: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db.insert(achievements).values(data).returning();
    return achievement;
  }

  async getAchievementsByUser(userId: string): Promise<Achievement[]> {
    return await db.select().from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(achievements.achievedAt);
  }

  // Team profile operations
  async createTeamProfile(data: InsertTeamProfile): Promise<TeamProfile> {
    const [teamProfile] = await db.insert(teamProfiles).values(data).returning();
    return teamProfile;
  }

  async getTeamProfile(id: string): Promise<TeamProfile | undefined> {
    const [teamProfile] = await db.select().from(teamProfiles).where(eq(teamProfiles.id, id));
    return teamProfile || undefined;
  }

  async getTeamProfilesByOwner(ownerId: string): Promise<TeamProfile[]> {
    return await db.select().from(teamProfiles).where(eq(teamProfiles.ownerId, ownerId));
  }

  async updateTeamProfile(id: string, data: Partial<TeamProfile>): Promise<TeamProfile | undefined> {
    const [teamProfile] = await db
      .update(teamProfiles)
      .set(data)
      .where(eq(teamProfiles.id, id))
      .returning();
    return teamProfile || undefined;
  }

  async deleteTeamProfile(id: string): Promise<void> {
    await db.delete(teamMembers).where(eq(teamMembers.teamId, id));
    await db.delete(teamProfiles).where(eq(teamProfiles.id, id));
  }

  // Team member operations
  async createTeamMember(data: InsertTeamMember): Promise<TeamMember> {
    const [member] = await db.insert(teamMembers).values(data).returning();
    return member;
  }

  async getMembersByTeam(teamId: string): Promise<TeamMember[]> {
    return await db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
  }

  async deleteMemberFromTeam(teamId: string, userId: string): Promise<void> {
    await db.delete(teamMembers)
      .where(and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.userId, userId)
      ));
  }

  // Server member operations
  async createServerMember(data: InsertServerMember): Promise<ServerMember> {
    const [member] = await db.insert(serverMembers).values(data).returning();
    return member;
  }

  async getMembersByServer(serverId: string): Promise<ServerMember[]> {
    return await db.select().from(serverMembers).where(eq(serverMembers.serverId, serverId));
  }

  async deleteMemberFromServer(serverId: string, userId: string): Promise<void> {
    await db.delete(serverMembers)
      .where(and(
        eq(serverMembers.serverId, serverId),
        eq(serverMembers.userId, userId)
      ));
  }
}

export const storage = new DatabaseStorage();
