import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id"),
  name: text("name").notNull(),
  game: text("game"),
  format: text("format", { enum: ["round_robin", "single_elimination", "swiss"] }).notNull(),
  status: text("status", { enum: ["upcoming", "in_progress", "completed"] }).notNull().default("upcoming"),
  totalTeams: integer("total_teams").notNull(),
  currentRound: integer("current_round").default(1),
  swissRounds: integer("swiss_rounds"),
  imageUrl: text("image_url"),
  prizeReward: text("prize_reward"),
  entryFee: text("entry_fee"),
  organizerId: varchar("organizer_id"),
  organizerName: text("organizer_name"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  platform: text("platform"),
  region: text("region"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  tournamentId: varchar("tournament_id").notNull(),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  points: integer("points").default(0),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull(),
  team1Id: varchar("team1_id"),
  team2Id: varchar("team2_id"),
  winnerId: varchar("winner_id"),
  round: integer("round").notNull(),
  status: text("status", { enum: ["pending", "in_progress", "completed"] }).notNull().default("pending"),
  team1Score: integer("team1_score"),
  team2Score: integer("team2_score"),
  isBye: integer("is_bye").default(0),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull(),
  teamId: varchar("team_id"),
  message: text("message").notNull(),
  imageUrl: text("image_url"),
  isSystem: integer("is_system").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const registrationConfigs = pgTable("registration_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull(),
  requiresPayment: integer("requires_payment").default(0),
  entryFee: text("entry_fee"),
  paymentUrl: text("payment_url"),
  paymentInstructions: text("payment_instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const registrationSteps = pgTable("registration_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configId: varchar("config_id").notNull(),
  stepNumber: integer("step_number").notNull(),
  stepTitle: text("step_title").notNull(),
  stepDescription: text("step_description"),
});

export const registrationFields = pgTable("registration_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stepId: varchar("step_id").notNull(),
  fieldType: text("field_type", { enum: ["text", "dropdown", "yesno"] }).notNull(),
  fieldLabel: text("field_label").notNull(),
  fieldPlaceholder: text("field_placeholder"),
  isRequired: integer("is_required").default(1),
  dropdownOptions: text("dropdown_options"),
  displayOrder: integer("display_order").notNull(),
});

export const registrations = pgTable("registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull(),
  teamName: text("team_name").notNull(),
  contactEmail: text("contact_email"),
  status: text("status", { enum: ["draft", "submitted", "approved", "rejected"] }).notNull().default("draft"),
  paymentStatus: text("payment_status", { enum: ["pending", "submitted", "verified", "rejected"] }).default("pending"),
  paymentProofUrl: text("payment_proof_url"),
  paymentTransactionId: text("payment_transaction_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const registrationResponses = pgTable("registration_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  registrationId: varchar("registration_id").notNull(),
  fieldId: varchar("field_id").notNull(),
  responseValue: text("response_value").notNull(),
});

export const insertTournamentSchema = createInsertSchema(tournaments)
  .omit({
    id: true,
    createdAt: true,
    currentRound: true,
    status: true,
  })
  .extend({
    startDate: z.union([z.string(), z.date()]).transform((val) => 
      typeof val === 'string' ? new Date(val) : val
    ).nullable().optional(),
    endDate: z.union([z.string(), z.date()]).transform((val) => 
      typeof val === 'string' ? new Date(val) : val
    ).nullable().optional(),
  });

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  wins: true,
  losses: true,
  points: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertRegistrationConfigSchema = createInsertSchema(registrationConfigs).omit({
  id: true,
  createdAt: true,
});

export const insertRegistrationStepSchema = createInsertSchema(registrationSteps).omit({
  id: true,
});

export const insertRegistrationFieldSchema = createInsertSchema(registrationFields).omit({
  id: true,
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRegistrationResponseSchema = createInsertSchema(registrationResponses).omit({
  id: true,
});

export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertRegistrationConfig = z.infer<typeof insertRegistrationConfigSchema>;
export type RegistrationConfig = typeof registrationConfigs.$inferSelect;
export type InsertRegistrationStep = z.infer<typeof insertRegistrationStepSchema>;
export type RegistrationStep = typeof registrationSteps.$inferSelect;
export type InsertRegistrationField = z.infer<typeof insertRegistrationFieldSchema>;
export type RegistrationField = typeof registrationFields.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;
export type InsertRegistrationResponse = z.infer<typeof insertRegistrationResponseSchema>;
export type RegistrationResponse = typeof registrationResponses.$inferSelect;

export const servers = pgTable("servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  memberCount: integer("member_count").default(0),
  iconUrl: text("icon_url"),
  backgroundUrl: text("background_url"),
  category: text("category"),
  gameTags: text("game_tags").array(),
  isPublic: integer("is_public").default(1),
  ownerId: varchar("owner_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const channels = pgTable("channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  type: text("type").notNull(),
  icon: text("icon").notNull().default("📝"),
  isPrivate: integer("is_private").default(0),
  position: integer("position").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const channelMessages = pgTable("channel_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").notNull(),
  userId: varchar("user_id").notNull(),
  username: text("username").notNull(),
  message: text("message"),
  imageUrl: text("image_url"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  replyToId: varchar("reply_to_id"),
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageThreads = pgTable("message_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantName: text("participant_name").notNull(),
  participantAvatar: text("participant_avatar"),
  lastMessage: text("last_message").notNull(),
  lastMessageTime: timestamp("last_message_time").defaultNow().notNull(),
  unreadCount: integer("unread_count").default(0),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type", { enum: ["match_result", "friend_request", "tournament_alert", "system"] }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  isRead: integer("is_read").default(0),
  actionUrl: text("action_url"),
});

export const insertServerSchema = createInsertSchema(servers).omit({
  id: true,
  createdAt: true,
});

export const insertChannelSchema = createInsertSchema(channels).omit({
  id: true,
  createdAt: true,
}).extend({
  type: z.string().min(1, "Channel type is required"),
  icon: z.string().min(1, "Channel icon is required"),
});

export const insertChannelMessageSchema = createInsertSchema(channelMessages).omit({
  id: true,
  createdAt: true,
  editedAt: true,
  deletedAt: true,
});

export const insertMessageThreadSchema = createInsertSchema(messageThreads).omit({
  id: true,
  lastMessageTime: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  timestamp: true,
});

export type InsertServer = z.infer<typeof insertServerSchema>;
export type Server = typeof servers.$inferSelect;
export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channels.$inferSelect;
export type InsertChannelMessage = z.infer<typeof insertChannelMessageSchema>;
export type ChannelMessage = typeof channelMessages.$inferSelect;
export type InsertMessageThread = z.infer<typeof insertMessageThreadSchema>;
export type MessageThread = typeof messageThreads.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export const posterTemplates = pgTable("poster_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  backgroundImageUrl: text("background_image_url").notNull(),
  category: text("category").notNull(),
  isActive: integer("is_active").default(1).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
});

export const posterTemplateTags = pgTable("poster_template_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull(),
  tag: text("tag").notNull(),
});

export const insertPosterTemplateSchema = createInsertSchema(posterTemplates).omit({
  id: true,
});

export const insertPosterTemplateTagSchema = createInsertSchema(posterTemplateTags).omit({
  id: true,
});

export type InsertPosterTemplate = z.infer<typeof insertPosterTemplateSchema>;
export type PosterTemplate = typeof posterTemplates.$inferSelect;
export type InsertPosterTemplateTag = z.infer<typeof insertPosterTemplateTagSchema>;
export type PosterTemplateTag = typeof posterTemplateTags.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull(),
  fullName: text("full_name"),
  passwordHash: text("password_hash"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  rankTitle: text("rank_title").default("Rookie"),
  totalTournaments: integer("total_tournaments").default(0),
  totalWins: integer("total_wins").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  achievedAt: timestamp("achieved_at").defaultNow().notNull(),
  category: text("category"),
  type: text("type", { enum: ["solo", "team"] }).notNull(),
});

export const teamProfiles = pgTable("team_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  tag: text("tag"),
  bio: text("bio"),
  logoUrl: text("logo_url"),
  ownerId: varchar("owner_id").notNull(),
  totalMembers: integer("total_members").default(1),
  totalTournaments: integer("total_tournaments").default(0),
  totalWins: integer("total_wins").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: text("role").default("Member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const serverMembers = pgTable("server_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: text("role").default("Member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  level: true,
  xp: true,
  totalTournaments: true,
  totalWins: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  achievedAt: true,
});

export const insertTeamProfileSchema = createInsertSchema(teamProfiles).omit({
  id: true,
  createdAt: true,
  totalMembers: true,
  totalTournaments: true,
  totalWins: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertServerMemberSchema = createInsertSchema(serverMembers).omit({
  id: true,
  joinedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertTeamProfile = z.infer<typeof insertTeamProfileSchema>;
export type TeamProfile = typeof teamProfiles.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertServerMember = z.infer<typeof insertServerMemberSchema>;
export type ServerMember = typeof serverMembers.$inferSelect;
