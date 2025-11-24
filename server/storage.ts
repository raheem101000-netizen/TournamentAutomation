import { eq, and, sql, ilike } from "drizzle-orm";
import { db } from "./db";
import bcrypt from "bcrypt";
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
  channelCategories,
  messageThreads,
  threadMessages,
  notifications,
  posterTemplates,
  posterTemplateTags,
  users,
  achievements,
  teamProfiles,
  teamMembers,
  serverMembers,
  serverRoles,
  serverBans,
  serverInvites,
  channelMessages,
  organizerPermissions,
  reports,
  customerServiceMessages,
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
  type ChannelCategory,
  type MessageThread,
  type ThreadMessage,
  type Notification,
  type PosterTemplate,
  type PosterTemplateTag,
  type User,
  type Achievement,
  type TeamProfile,
  type TeamMember,
  type ServerMember,
  type ServerRole,
  type ServerBan,
  type ServerInvite,
  type ChannelMessage,
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
  type InsertChannelCategory,
  type InsertPosterTemplate,
  type InsertPosterTemplateTag,
  type InsertUser,
  type InsertAchievement,
  type InsertTeamProfile,
  type InsertTeamMember,
  type InsertServerMember,
  type InsertServerRole,
  type InsertServerBan,
  type OrganizerPermission,
  type Report,
  type CustomerServiceMessage,
  type InsertServerInvite,
  type InsertChannelMessage,
  type InsertMessageThread,
  type InsertThreadMessage,
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
  joinServer(serverId: string, userId: string): Promise<ServerMember>;
  getServersByUser(userId: string): Promise<Server[]>;
  isUserInServer(serverId: string, userId: string): Promise<boolean>;
  getServerMember(serverId: string, userId: string): Promise<ServerMember | undefined>;
  
  // Channel operations
  createChannel(data: InsertChannel): Promise<Channel>;
  getChannelsByServer(serverId: string): Promise<Channel[]>;
  getChannel(id: string): Promise<Channel | undefined>;
  updateChannel(id: string, data: Partial<Channel>): Promise<Channel | undefined>;
  deleteChannel(id: string): Promise<void>;
  
  // Channel category operations
  createChannelCategory(data: InsertChannelCategory): Promise<ChannelCategory>;
  getCategoriesByServer(serverId: string): Promise<ChannelCategory[]>;
  updateChannelCategory(id: string, data: Partial<ChannelCategory>): Promise<ChannelCategory | undefined>;
  deleteChannelCategory(id: string): Promise<void>;
  
  // Channel message operations
  createChannelMessage(data: InsertChannelMessage): Promise<ChannelMessage>;
  getChannelMessages(channelId: string, limit?: number): Promise<ChannelMessage[]>;
  searchChannelMessages(channelId: string, query: string): Promise<ChannelMessage[]>;
  deleteChannelMessage(id: string): Promise<void>;
  
  // Server role operations
  createServerRole(data: InsertServerRole): Promise<ServerRole>;
  getRolesByServer(serverId: string): Promise<ServerRole[]>;
  getRolesByUser(userId: string, serverId: string): Promise<ServerRole[]>;
  updateServerRole(id: string, data: Partial<ServerRole>): Promise<ServerRole | undefined>;
  deleteServerRole(id: string): Promise<void>;
  
  // Server ban operations
  createServerBan(data: InsertServerBan): Promise<ServerBan>;
  getBansByServer(serverId: string): Promise<ServerBan[]>;
  deleteBan(serverId: string, userId: string): Promise<void>;
  
  // Server invite operations
  createServerInvite(data: InsertServerInvite): Promise<ServerInvite>;
  getInvitesByServer(serverId: string): Promise<ServerInvite[]>;
  getInviteByCode(code: string): Promise<ServerInvite | undefined>;
  incrementInviteUse(code: string): Promise<void>;
  deleteInvite(id: string): Promise<void>;
  
  // Server update operations
  updateServer(id: string, data: Partial<Server>): Promise<Server | undefined>;
  
  // Mobile preview operations
  getAllMessageThreads(): Promise<MessageThread[]>;
  createMessageThread(data: InsertMessageThread): Promise<MessageThread>;
  getMessageThread(id: string): Promise<MessageThread | undefined>;
  createThreadMessage(data: InsertThreadMessage): Promise<ThreadMessage>;
  getThreadMessages(threadId: string): Promise<ThreadMessage[]>;
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
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  changeUserPassword(id: string, currentPassword: string, newPassword: string): Promise<boolean>;
  deleteUser(id: string): Promise<void>;

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
  getServerMemberByUserId(serverId: string, userId: string): Promise<ServerMember | undefined>;
  updateServerMember(serverId: string, userId: string, data: Partial<InsertServerMember>): Promise<ServerMember | undefined>;
  deleteMemberFromServer(serverId: string, userId: string): Promise<void>;
  getEffectivePermissions(serverId: string, userId: string): Promise<string[]>;

  // Admin operations
  getAllUsers(): Promise<User[]>;
  getOrganizerUsers(): Promise<User[]>;
  getOrganizerPermission(organizerId: string): Promise<number | undefined>;
  updateOrganizerPermission(organizerId: string, data: Partial<OrganizerPermission>): Promise<OrganizerPermission | undefined>;
  getAllAchievements(): Promise<Achievement[]>;
  deleteAchievement(achievementId: string): Promise<void>;
  deleteTournament(tournamentId: string): Promise<void>;
  getAllReports(): Promise<Report[]>;
  updateReport(reportId: string, data: Partial<Report>): Promise<Report | undefined>;
  getAllCustomerServiceMessages(): Promise<CustomerServiceMessage[]>;
  updateCustomerServiceMessage(messageId: string, data: Partial<CustomerServiceMessage>): Promise<CustomerServiceMessage | undefined>;
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

  async joinServer(serverId: string, userId: string): Promise<ServerMember> {
    const [member] = await db.insert(serverMembers).values({
      serverId,
      userId,
      role: "Member",
    }).returning();
    
    // Increment member count
    await db.update(servers)
      .set({ memberCount: sql`${servers.memberCount} + 1` })
      .where(eq(servers.id, serverId));
    
    return member;
  }

  async getServersByUser(userId: string): Promise<Server[]> {
    const userServerIds = await db
      .select({ serverId: serverMembers.serverId })
      .from(serverMembers)
      .where(eq(serverMembers.userId, userId));
    
    if (userServerIds.length === 0) return [];
    
    return await db.select()
      .from(servers)
      .where(sql`${servers.id} IN (${sql.join(userServerIds.map(s => sql`${s.serverId}`), sql`, `)})`);
  }

  async isUserInServer(serverId: string, userId: string): Promise<boolean> {
    const [member] = await db
      .select()
      .from(serverMembers)
      .where(sql`${serverMembers.serverId} = ${serverId} AND ${serverMembers.userId} = ${userId}`)
      .limit(1);
    return !!member;
  }

  async getServerMember(serverId: string, userId: string): Promise<ServerMember | undefined> {
    const [member] = await db
      .select()
      .from(serverMembers)
      .where(sql`${serverMembers.serverId} = ${serverId} AND ${serverMembers.userId} = ${userId}`)
      .limit(1);
    return member;
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

  async createMessageThread(data: InsertMessageThread): Promise<MessageThread> {
    const [thread] = await db.insert(messageThreads).values(data).returning();
    return thread;
  }

  async getMessageThread(id: string): Promise<MessageThread | undefined> {
    const [thread] = await db.select().from(messageThreads).where(eq(messageThreads.id, id));
    return thread || undefined;
  }

  async createThreadMessage(data: InsertThreadMessage): Promise<ThreadMessage> {
    const [message] = await db.insert(threadMessages).values(data).returning();
    return message;
  }

  async getThreadMessages(threadId: string): Promise<ThreadMessage[]> {
    return await db.select().from(threadMessages).where(eq(threadMessages.threadId, threadId)).orderBy(threadMessages.createdAt);
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async changeUserPassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user || !user.passwordHash) {
      return false;
    }
    
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return false;
    }
    
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, id));
    
    return true;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Achievement operations
  async createAchievement(data: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db.insert(achievements).values(data).returning();
    return achievement;
  }

  async getAchievementsByUser(userId: string): Promise<any[]> {
    const achievementsList = await db.select().from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(achievements.achievedAt);
    
    // Fetch server names for achievements that have a serverId
    const withServerNames = await Promise.all(
      achievementsList.map(async (ach) => {
        if (ach.serverId) {
          const [server] = await db.select().from(servers).where(eq(servers.id, ach.serverId));
          return { ...ach, serverName: server?.name };
        }
        return ach;
      })
    );
    
    return withServerNames;
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

  async getServerMemberByUserId(serverId: string, userId: string): Promise<ServerMember | undefined> {
    const [member] = await db.select().from(serverMembers)
      .where(and(
        eq(serverMembers.serverId, serverId),
        eq(serverMembers.userId, userId)
      ));
    return member || undefined;
  }

  async updateServerMember(serverId: string, userId: string, data: Partial<InsertServerMember>): Promise<ServerMember | undefined> {
    const [member] = await db
      .update(serverMembers)
      .set(data)
      .where(and(
        eq(serverMembers.serverId, serverId),
        eq(serverMembers.userId, userId)
      ))
      .returning();
    return member || undefined;
  }

  async deleteMemberFromServer(serverId: string, userId: string): Promise<void> {
    await db.delete(serverMembers)
      .where(and(
        eq(serverMembers.serverId, serverId),
        eq(serverMembers.userId, userId)
      ));
  }

  async getEffectivePermissions(serverId: string, userId: string): Promise<string[]> {
    const member = await this.getServerMemberByUserId(serverId, userId);
    if (!member) {
      return [];
    }

    const permissions = new Set<string>(member.explicitPermissions || []);

    if (member.roleId) {
      const [role] = await db.select().from(serverRoles).where(eq(serverRoles.id, member.roleId));
      if (role && role.permissions) {
        role.permissions.forEach((p: string) => permissions.add(p));
      }
    }

    return Array.from(permissions);
  }

  // Channel update/delete operations
  async updateChannel(id: string, data: Partial<Channel>): Promise<Channel | undefined> {
    const [channel] = await db
      .update(channels)
      .set(data)
      .where(eq(channels.id, id))
      .returning();
    return channel || undefined;
  }

  async deleteChannel(id: string): Promise<void> {
    await db.delete(channelMessages).where(eq(channelMessages.channelId, id));
    await db.delete(channels).where(eq(channels.id, id));
  }

  // Channel category operations
  async createChannelCategory(data: InsertChannelCategory): Promise<ChannelCategory> {
    const [category] = await db.insert(channelCategories).values(data).returning();
    return category;
  }

  async getCategoriesByServer(serverId: string): Promise<ChannelCategory[]> {
    return await db.select().from(channelCategories)
      .where(eq(channelCategories.serverId, serverId))
      .orderBy(channelCategories.position);
  }

  async updateChannelCategory(id: string, data: Partial<ChannelCategory>): Promise<ChannelCategory | undefined> {
    const [category] = await db
      .update(channelCategories)
      .set(data)
      .where(eq(channelCategories.id, id))
      .returning();
    return category || undefined;
  }

  async deleteChannelCategory(id: string): Promise<void> {
    await db.update(channels)
      .set({ categoryId: null })
      .where(eq(channels.categoryId, id));
    await db.delete(channelCategories).where(eq(channelCategories.id, id));
  }

  // Channel message operations
  async createChannelMessage(data: InsertChannelMessage): Promise<ChannelMessage> {
    const [message] = await db.insert(channelMessages).values(data).returning();
    return message;
  }

  async getChannelMessages(channelId: string, limit: number = 100): Promise<ChannelMessage[]> {
    return await db.select().from(channelMessages)
      .where(eq(channelMessages.channelId, channelId))
      .orderBy(channelMessages.createdAt)
      .limit(limit);
  }

  async searchChannelMessages(channelId: string, query: string): Promise<ChannelMessage[]> {
    return await db.select().from(channelMessages)
      .where(and(
        eq(channelMessages.channelId, channelId),
        sql`${channelMessages.message} ILIKE ${`%${query}%`}`
      ))
      .orderBy(channelMessages.createdAt);
  }

  async deleteChannelMessage(id: string): Promise<void> {
    await db.delete(channelMessages).where(eq(channelMessages.id, id));
  }

  // Server role operations
  async createServerRole(data: InsertServerRole): Promise<ServerRole> {
    const [role] = await db.insert(serverRoles).values(data).returning();
    return role;
  }

  async getRolesByServer(serverId: string): Promise<ServerRole[]> {
    return await db.select().from(serverRoles)
      .where(eq(serverRoles.serverId, serverId))
      .orderBy(serverRoles.position);
  }

  async getRolesByUser(userId: string, serverId: string): Promise<ServerRole[]> {
    // Get the server member to find their roleId
    const member = await this.getServerMemberByUserId(serverId, userId);
    if (!member || !member.roleId) {
      return [];
    }
    
    // Get the specific role(s) assigned to this user
    const [role] = await db.select().from(serverRoles)
      .where(eq(serverRoles.id, member.roleId));
    
    return role ? [role] : [];
  }

  async updateServerRole(id: string, data: Partial<ServerRole>): Promise<ServerRole | undefined> {
    const [role] = await db
      .update(serverRoles)
      .set(data)
      .where(eq(serverRoles.id, id))
      .returning();
    return role || undefined;
  }

  async deleteServerRole(id: string): Promise<void> {
    await db.delete(serverRoles).where(eq(serverRoles.id, id));
  }

  // Server ban operations
  async createServerBan(data: InsertServerBan): Promise<ServerBan> {
    const [ban] = await db.insert(serverBans).values(data).returning();
    await this.deleteMemberFromServer(data.serverId, data.userId);
    return ban;
  }

  async getBansByServer(serverId: string): Promise<ServerBan[]> {
    return await db.select().from(serverBans)
      .where(eq(serverBans.serverId, serverId))
      .orderBy(serverBans.bannedAt);
  }

  async deleteBan(serverId: string, userId: string): Promise<void> {
    await db.delete(serverBans)
      .where(and(
        eq(serverBans.serverId, serverId),
        eq(serverBans.userId, userId)
      ));
  }

  // Server invite operations
  async createServerInvite(data: InsertServerInvite): Promise<ServerInvite> {
    const [invite] = await db.insert(serverInvites).values(data).returning();
    return invite;
  }

  async getInvitesByServer(serverId: string): Promise<ServerInvite[]> {
    return await db.select().from(serverInvites)
      .where(eq(serverInvites.serverId, serverId))
      .orderBy(serverInvites.createdAt);
  }

  async getInviteByCode(code: string): Promise<ServerInvite | undefined> {
    const [invite] = await db.select().from(serverInvites)
      .where(eq(serverInvites.code, code));
    return invite || undefined;
  }

  async incrementInviteUse(code: string): Promise<void> {
    await db
      .update(serverInvites)
      .set({ currentUses: sql`${serverInvites.currentUses} + 1` })
      .where(eq(serverInvites.code, code));
  }

  async deleteInvite(id: string): Promise<void> {
    await db.delete(serverInvites).where(eq(serverInvites.id, id));
  }

  // Server update operations
  async updateServer(id: string, data: Partial<Server>): Promise<Server | undefined> {
    const [server] = await db
      .update(servers)
      .set(data)
      .where(eq(servers.id, id))
      .returning();
    return server || undefined;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async getOrganizerUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "organizer"));
  }

  async getOrganizerPermission(organizerId: string): Promise<number | undefined> {
    const [perm] = await db.select().from(organizerPermissions).where(eq(organizerPermissions.organizerId, organizerId));
    return perm?.canGiveAchievements ?? 1;
  }

  async updateOrganizerPermission(organizerId: string, data: Partial<OrganizerPermission>): Promise<OrganizerPermission | undefined> {
    const existing = await this.getOrganizerPermission(organizerId);
    if (!existing) {
      const [perm] = await db.insert(organizerPermissions).values({ organizerId, ...data }).returning();
      return perm;
    }
    const [perm] = await db
      .update(organizerPermissions)
      .set(data)
      .where(eq(organizerPermissions.organizerId, organizerId))
      .returning();
    return perm || undefined;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements).orderBy(achievements.achievedAt);
  }

  async deleteAchievement(achievementId: string): Promise<void> {
    await db.delete(achievements).where(eq(achievements.id, achievementId));
  }

  async deleteTournament(tournamentId: string): Promise<void> {
    await db.delete(tournaments).where(eq(tournaments.id, tournamentId));
  }

  async getAllReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(reports.createdAt);
  }

  async updateReport(reportId: string, data: Partial<Report>): Promise<Report | undefined> {
    const [report] = await db
      .update(reports)
      .set(data)
      .where(eq(reports.id, reportId))
      .returning();
    return report || undefined;
  }

  async getAllCustomerServiceMessages(): Promise<CustomerServiceMessage[]> {
    return await db.select().from(customerServiceMessages).orderBy(customerServiceMessages.createdAt);
  }

  async updateCustomerServiceMessage(messageId: string, data: Partial<CustomerServiceMessage>): Promise<CustomerServiceMessage | undefined> {
    const [message] = await db
      .update(customerServiceMessages)
      .set(data)
      .where(eq(customerServiceMessages.id, messageId))
      .returning();
    return message || undefined;
  }
}

export const storage = new DatabaseStorage();
