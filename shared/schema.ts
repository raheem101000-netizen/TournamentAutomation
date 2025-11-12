import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  format: text("format", { enum: ["round_robin", "single_elimination", "swiss"] }).notNull(),
  status: text("status", { enum: ["upcoming", "in_progress", "completed"] }).notNull().default("upcoming"),
  totalTeams: integer("total_teams").notNull(),
  currentRound: integer("current_round").default(1),
  swissRounds: integer("swiss_rounds"),
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
  entryFee: integer("entry_fee"),
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

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  currentRound: true,
  status: true,
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
