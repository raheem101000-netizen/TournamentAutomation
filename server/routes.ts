import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createProxyMiddleware } from "http-proxy-middleware";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import {
  insertTournamentSchema,
  insertTeamSchema,
  insertMatchSchema,
  insertChatMessageSchema,
  insertRegistrationConfigSchema,
  insertRegistrationStepSchema,
  insertRegistrationFieldSchema,
  insertRegistrationSchema,
  insertRegistrationResponseSchema,
  insertServerSchema,
  insertChannelSchema,
  insertChannelCategorySchema,
  insertServerRoleSchema,
  insertServerBanSchema,
  insertServerInviteSchema,
  insertChannelMessageSchema,
  insertPosterTemplateSchema,
  insertPosterTemplateTagSchema,
  insertUserSchema,
  insertAchievementSchema,
  insertTeamProfileSchema,
  insertTeamMemberSchema,
  insertServerMemberSchema,
} from "@shared/schema";
import { z } from "zod";
import {
  generateRoundRobinBracket,
  generateSingleEliminationBracket,
  generateSwissSystemRound,
} from "./bracket-generator";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use('/expo-app', createProxyMiddleware({
    target: 'http://127.0.0.1:8081',
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      '^/expo-app': ''
    }
  }));
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ 
    noServer: true
  });

  const matchConnections = new Map<string, Set<WebSocket>>();

  httpServer.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
    
    if (pathname === '/ws/chat') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on("connection", (ws, req) => {
    const matchId = new URL(req.url || "", `http://${req.headers.host}`).searchParams.get("matchId");

    if (matchId) {
      if (!matchConnections.has(matchId)) {
        matchConnections.set(matchId, new Set());
      }
      matchConnections.get(matchId)!.add(ws);

      // Handle incoming messages
      ws.on("message", async (data) => {
        try {
          const messageData = JSON.parse(data.toString());
          
          // Validate using schema and ensure matchId from URL is used
          const validatedData = insertChatMessageSchema.parse({
            matchId: matchId, // Use matchId from connection URL for security
            teamId: messageData.teamId || null, // Optional field
            message: messageData.message,
            imageUrl: messageData.imageUrl || null, // Optional field
          });

          // Save message to storage
          const savedMessage = await storage.createChatMessage(validatedData);

          // Broadcast to all connections in this match with consistent format
          const broadcastPayload = {
            type: "new_message",
            message: savedMessage,
          };
          broadcastToMatch(matchId, broadcastPayload);
        } catch (error: any) {
          console.error("Error handling WebSocket message:", error);
          console.error("Error details:", error.message);
          ws.send(JSON.stringify({ error: "Failed to process message", details: error.message }));
        }
      });

      ws.on("close", () => {
        matchConnections.get(matchId)?.delete(ws);
        if (matchConnections.get(matchId)?.size === 0) {
          matchConnections.delete(matchId);
        }
      });
    }
  });

  const broadcastToMatch = (matchId: string, data: any) => {
    const connections = matchConnections.get(matchId);
    if (connections) {
      const message = JSON.stringify(data);
      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  };

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  };

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const registerSchema = z.object({
        fullName: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
      });
      const validatedData = registerSchema.parse(req.body);

      // Check if user with email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user with hashed password
      const user = await storage.createUser({
        username: validatedData.fullName.toLowerCase().replace(/\s+/g, ''),
        email: validatedData.email,
        passwordHash: hashedPassword,
        displayName: validatedData.fullName,
        bio: null,
        avatarUrl: null,
        language: 'en',
        isDisabled: 0,
      });

      res.status(201).json({ 
        message: "Registration successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
        }
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid input data" });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginSchema = z.object({
        email: z.string().email(),
        password: z.string(),
      });
      const validatedData = loginSchema.parse(req.body);

      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Verify password
      const bcrypt = await import('bcrypt');
      const passwordValid = await bcrypt.compare(validatedData.password, user.passwordHash);

      if (!passwordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check if account is disabled
      if (user.isDisabled === 1) {
        return res.status(403).json({ error: "Account is disabled" });
      }

      // Create session
      req.session.userId = user.id;

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          level: user.level,
        },
        token: "session-based-auth",
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid input data" });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        level: user.level,
        language: user.language,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Tournament routes
  app.get("/api/tournaments", async (req, res) => {
    try {
      const tournaments = await storage.getAllTournaments();
      res.json(tournaments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.getTournament(req.params.id);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.updateTournament(req.params.id, req.body);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tournaments", async (req, res) => {
    try {
      console.log('[DEBUG] Tournament creation request body:', JSON.stringify(req.body, null, 2));
      const validatedData = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(validatedData);

      const teamNames = req.body.teamNames as string[];
      if (teamNames && teamNames.length > 0) {
        const createdTeams = await Promise.all(
          teamNames.map((name) =>
            storage.createTeam({
              name,
              tournamentId: tournament.id,
            })
          )
        );

        let matches;
        if (tournament.format === "round_robin") {
          matches = generateRoundRobinBracket(tournament.id, createdTeams).matches;
        } else if (tournament.format === "single_elimination") {
          matches = generateSingleEliminationBracket(tournament.id, createdTeams).matches;
        } else if (tournament.format === "swiss") {
          matches = generateSwissSystemRound(tournament.id, createdTeams, 1, []).matches;
        }

        if (matches) {
          await Promise.all(matches.map((match) => storage.createMatch(match)));
        }

        await storage.updateTournament(tournament.id, { status: "in_progress" });
      }

      const registrationConfig = req.body.registrationConfig;
      if (registrationConfig) {
        let createdConfigId: string | null = null;
        const createdStepIds: string[] = [];
        
        try {
          const configData = {
            tournamentId: tournament.id,
            requiresPayment: registrationConfig.requiresPayment,
            entryFee: registrationConfig.entryFee,
            paymentUrl: registrationConfig.paymentUrl,
            paymentInstructions: registrationConfig.paymentInstructions
          };
          
          const validatedConfig = insertRegistrationConfigSchema.parse(configData);
          const createdConfig = await storage.createRegistrationConfig(validatedConfig);
          createdConfigId = createdConfig.id;

          for (const step of registrationConfig.steps) {
            const stepData = {
              configId: createdConfig.id,
              stepNumber: step.stepNumber,
              stepTitle: step.stepTitle,
              stepDescription: step.stepDescription
            };
            const validatedStep = insertRegistrationStepSchema.parse(stepData);
            const createdStep = await storage.createRegistrationStep(validatedStep);
            createdStepIds.push(createdStep.id);

            for (const field of step.fields) {
              const fieldData = {
                stepId: createdStep.id,
                fieldType: field.fieldType,
                fieldLabel: field.fieldLabel,
                fieldPlaceholder: field.fieldPlaceholder,
                isRequired: field.isRequired,
                dropdownOptions: field.dropdownOptions,
                displayOrder: field.displayOrder
              };
              const validatedField = insertRegistrationFieldSchema.parse(fieldData);
              await storage.createRegistrationField(validatedField);
            }
          }
        } catch (regError: any) {
          if (createdConfigId) {
            await storage.deleteRegistrationConfig(createdConfigId);
          }
          throw new Error(`Failed to create registration config: ${regError.message}`);
        }
      }

      res.status(201).json(tournament);
    } catch (error: any) {
      console.error('[DEBUG] Tournament creation error:', error);
      if (error.errors) {
        console.error('[DEBUG] Zod validation errors:', JSON.stringify(error.errors, null, 2));
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.updateTournament(req.params.id, req.body);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tournaments/:id/registration/config", async (req, res) => {
    try {
      const config = await storage.getRegistrationConfigByTournament(req.params.id);
      if (!config) {
        return res.status(404).json({ error: "Registration config not found" });
      }

      const steps = await storage.getStepsByConfig(config.id);
      
      const stepsWithFields = await Promise.all(
        steps.map(async (step) => {
          const fields = await storage.getFieldsByStep(step.id);
          return {
            ...step,
            fields: fields.sort((a, b) => a.displayOrder - b.displayOrder)
          };
        })
      );

      res.json({
        ...config,
        steps: stepsWithFields.sort((a, b) => a.stepNumber - b.stepNumber)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Team routes
  app.get("/api/tournaments/:tournamentId/teams", async (req, res) => {
    try {
      const teams = await storage.getTeamsByTournament(req.params.tournamentId);
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData);
      res.status(201).json(team);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Match routes
  app.get("/api/tournaments/:tournamentId/matches", async (req, res) => {
    try {
      const matches = await storage.getMatchesByTournament(req.params.tournamentId);
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/matches/:id", async (req, res) => {
    try {
      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      res.json(match);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/matches/:id", async (req, res) => {
    try {
      const currentMatch = await storage.getMatch(req.params.id);
      if (!currentMatch) {
        return res.status(404).json({ error: "Match not found" });
      }

      if (req.body.winnerId) {
        const validTeams = [currentMatch.team1Id, currentMatch.team2Id].filter(Boolean);
        if (!validTeams.includes(req.body.winnerId)) {
          return res.status(400).json({ error: "Winner must be one of the match participants" });
        }
      }

      const wasAlreadyCompleted = currentMatch.status === "completed";
      
      const match = await storage.updateMatch(req.params.id, req.body);
      if (!match) {
        return res.status(404).json({ error: "Match not found after update" });
      }

      if (!wasAlreadyCompleted && req.body.winnerId && req.body.team1Score !== undefined && req.body.team2Score !== undefined) {
        const teams = [match.team1Id, match.team2Id].filter(Boolean) as string[];
        const loserId = teams.find((id) => id !== req.body.winnerId);

        if (req.body.winnerId) {
          const winnerTeam = await storage.getTeam(req.body.winnerId);
          if (winnerTeam) {
            await storage.updateTeam(req.body.winnerId, {
              wins: (winnerTeam.wins ?? 0) + 1,
              points: (winnerTeam.points ?? 0) + 3,
            });
          }
        }

        if (loserId) {
          const loserTeam = await storage.getTeam(loserId);
          if (loserTeam) {
            await storage.updateTeam(loserId, {
              losses: (loserTeam.losses ?? 0) + 1,
            });
          }
        }

        const tournament = await storage.getTournament(match.tournamentId);
        
        if (tournament && tournament.format === "single_elimination" && req.body.winnerId) {
          const allMatches = await storage.getMatchesByTournament(tournament.id);
          const currentRoundMatches = allMatches.filter((m) => m.round === match.round);
          const matchIndex = currentRoundMatches.findIndex((m) => m.id === match.id);
          
          if (matchIndex !== -1) {
            const nextRoundMatchIndex = Math.floor(matchIndex / 2);
            const nextRoundMatches = allMatches.filter((m) => m.round === match.round + 1);
            const nextMatch = nextRoundMatches[nextRoundMatchIndex];
            
            if (nextMatch) {
              const isFirstSlot = matchIndex % 2 === 0;
              await storage.updateMatch(nextMatch.id, {
                [isFirstSlot ? "team1Id" : "team2Id"]: req.body.winnerId,
              });
            }
          }
        }
        
        if (tournament && tournament.format === "swiss") {
          const allMatches = await storage.getMatchesByTournament(tournament.id);
          const currentRoundMatches = allMatches.filter((m) => m.round === tournament.currentRound);
          const allCompleted = currentRoundMatches.every((m) => m.status === "completed");

          const currentRound = tournament.currentRound ?? 1;
          if (allCompleted && currentRound < (tournament.swissRounds ?? 5)) {
            const teams = await storage.getTeamsByTournament(tournament.id);
            const nextRound = currentRound + 1;
            const newMatches = generateSwissSystemRound(tournament.id, teams, nextRound, allMatches).matches;

            await Promise.all(newMatches.map((m) => storage.createMatch(m)));
            await storage.updateTournament(tournament.id, { currentRound: nextRound });
          }
        }
      }

      res.json(match);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Chat routes
  app.get("/api/matches/:matchId/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessagesByMatch(req.params.matchId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/matches/:matchId/messages", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse({
        ...req.body,
        matchId: req.params.matchId,
      });
      const message = await storage.createChatMessage(validatedData);

      broadcastToMatch(req.params.matchId, {
        type: "new_message",
        message,
      });

      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Registration Config routes
  app.post("/api/tournaments/:tournamentId/registration-config", async (req, res) => {
    try {
      const { steps, ...configData } = req.body;
      
      const config = await storage.createRegistrationConfig({
        ...configData,
        tournamentId: req.params.tournamentId,
      });

      if (steps && steps.length > 0) {
        for (const step of steps) {
          const { fields, ...stepData } = step;
          const createdStep = await storage.createRegistrationStep({
            ...stepData,
            configId: config.id,
          });

          if (fields && fields.length > 0) {
            await Promise.all(
              fields.map((field: any) =>
                storage.createRegistrationField({
                  ...field,
                  stepId: createdStep.id,
                })
              )
            );
          }
        }
      }

      res.status(201).json(config);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/tournaments/:tournamentId/registration-config", async (req, res) => {
    try {
      const config = await storage.getRegistrationConfigByTournament(req.params.tournamentId);
      if (!config) {
        return res.status(404).json({ error: "Registration config not found" });
      }

      const steps = await storage.getStepsByConfig(config.id);
      const stepsWithFields = await Promise.all(
        steps.map(async (step) => {
          const fields = await storage.getFieldsByStep(step.id);
          return { ...step, fields };
        })
      );

      res.json({ ...config, steps: stepsWithFields });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Registration submission routes
  app.post("/api/tournaments/:tournamentId/registrations", async (req, res) => {
    try {
      const tournamentId = req.params.tournamentId;
      
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }

      const { responses, paymentProofUrl, paymentTransactionId, ...registrationData} = req.body;

      const existingTeams = await storage.getTeamsByTournament(tournamentId);
      const existingRegistrations = await storage.getRegistrationsByTournament(tournamentId);
      
      const pendingRegistrations = existingRegistrations.filter(
        r => r.status === "submitted"
      );
      
      const totalCapacityUsed = existingTeams.length + pendingRegistrations.length;
      if (totalCapacityUsed >= tournament.totalTeams) {
        return res.status(409).json({ error: "Tournament is full" });
      }

      const teamNameLower = registrationData.teamName?.toLowerCase();
      const teamNameExistsInTeams = existingTeams.some(
        team => team.name.toLowerCase() === teamNameLower
      );
      const teamNameExistsInRegistrations = existingRegistrations.some(
        reg => (reg.status === "submitted" || reg.status === "approved") && 
               reg.teamName?.toLowerCase() === teamNameLower
      );
      
      if (teamNameExistsInTeams || teamNameExistsInRegistrations) {
        return res.status(409).json({ error: "Team name already exists in this tournament" });
      }

      const config = await storage.getRegistrationConfigByTournament(tournamentId);
      
      let paymentStatus = "pending";
      let registrationStatus = "submitted";
      
      if (config && config.requiresPayment) {
        if (paymentProofUrl || paymentTransactionId) {
          paymentStatus = "submitted";
        }
      } else {
        paymentStatus = "verified";
        registrationStatus = "approved";
      }
      
      const registration = await storage.createRegistration({
        ...registrationData,
        tournamentId,
        status: registrationStatus,
        paymentStatus,
        paymentProofUrl: paymentProofUrl || null,
        paymentTransactionId: paymentTransactionId || null,
      });

      let parsedResponses = responses;
      if (typeof responses === 'string') {
        try {
          parsedResponses = JSON.parse(responses);
        } catch (e) {
          console.error("Failed to parse responses JSON:", e);
        }
      }

      if (parsedResponses && typeof parsedResponses === 'object') {
        await Promise.all(
          Object.entries(parsedResponses).map(([fieldId, value]) =>
            storage.createRegistrationResponse({
              registrationId: registration.id,
              fieldId,
              responseValue: String(value),
            })
          )
        );
      }

      if (registrationStatus === "approved") {
        await storage.createTeam({
          name: registrationData.teamName,
          tournamentId: tournament.id,
        });
      }

      res.status(201).json(registration);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/tournaments/:tournamentId/registrations", async (req, res) => {
    try {
      const registrations = await storage.getRegistrationsByTournament(req.params.tournamentId);
      res.json(registrations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/registrations/:id", async (req, res) => {
    try {
      const registration = await storage.getRegistration(req.params.id);
      if (!registration) {
        return res.status(404).json({ error: "Registration not found" });
      }

      const responses = await storage.getResponsesByRegistration(registration.id);
      res.json({ ...registration, responses });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/registrations/:id", async (req, res) => {
    try {
      const registration = await storage.updateRegistration(req.params.id, req.body);
      if (!registration) {
        return res.status(404).json({ error: "Registration not found" });
      }

      if (req.body.paymentStatus === "verified" && registration.status === "submitted") {
        await storage.createTeam({
          name: registration.teamName,
          tournamentId: registration.tournamentId,
        });

        await storage.updateRegistration(registration.id, { status: "approved" });
      }

      res.json(registration);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mobile preview API routes
  app.get("/api/mobile-preview/servers", async (_req, res) => {
    try {
      const servers = await storage.getAllServers();
      res.json(servers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/mobile-preview/messages", async (_req, res) => {
    try {
      const messages = await storage.getAllMessageThreads();
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/mobile-preview/notifications", async (_req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Server routes
  app.post("/api/servers", async (req, res) => {
    try {
      const validatedData = insertServerSchema.parse(req.body);
      const server = await storage.createServer(validatedData);
      
      // Create default channels for the server
      const defaultChannels = [
        { name: "tournament-dashboard", slug: "tournament-dashboard", type: "tournament_dashboard", icon: "🏆", serverId: server.id, position: 0, isPrivate: 1 },
        { name: "announcements", slug: "announcements", type: "announcements", icon: "📢", serverId: server.id, position: 1 },
        { name: "general", slug: "general", type: "chat", icon: "💬", serverId: server.id, position: 2 },
      ];
      
      for (const channelData of defaultChannels) {
        await storage.createChannel(channelData);
      }
      
      res.status(201).json(server);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/servers/:id", async (req, res) => {
    try {
      const server = await storage.getServer(req.params.id);
      if (!server) {
        return res.status(404).json({ error: "Server not found" });
      }
      res.json(server);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/servers/:serverId/join", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      // Check if user is already in server
      const existingMember = await storage.getServerMember(req.params.serverId, userId);
      if (existingMember) {
        // Return success with alreadyMember flag - idempotent behavior
        return res.status(200).json({ 
          member: existingMember, 
          alreadyMember: true,
          serverId: req.params.serverId
        });
      }
      
      const member = await storage.joinServer(req.params.serverId, userId);
      res.status(201).json({ 
        member, 
        alreadyMember: false,
        serverId: req.params.serverId
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users/:userId/servers", async (req, res) => {
    try {
      const servers = await storage.getServersByUser(req.params.userId);
      res.json(servers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Channel routes
  app.get("/api/servers/:serverId/channels", async (req, res) => {
    try {
      const channels = await storage.getChannelsByServer(req.params.serverId);
      res.json(channels);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/servers/:serverId/channels", async (req, res) => {
    try {
      const validatedData = insertChannelSchema.parse({
        ...req.body,
        serverId: req.params.serverId,
      });
      const channel = await storage.createChannel(validatedData);
      res.status(201).json(channel);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/channels/:id", async (req, res) => {
    try {
      const channel = await storage.getChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ error: "Channel not found" });
      }
      res.json(channel);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Poster template routes
  app.get("/api/poster-templates", async (req, res) => {
    try {
      const templates = req.query.active === "true"
        ? await storage.getActivePosterTemplates()
        : await storage.getAllPosterTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/poster-templates/:id", async (req, res) => {
    try {
      const template = await storage.getPosterTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/poster-templates", async (req, res) => {
    try {
      const validatedData = insertPosterTemplateSchema.parse(req.body);
      const template = await storage.createPosterTemplate(validatedData);
      
      if (req.body.tags && Array.isArray(req.body.tags)) {
        for (const tag of req.body.tags) {
          await storage.createPosterTemplateTag({
            templateId: template.id,
            tag,
          });
        }
      }
      
      res.status(201).json(template);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/poster-templates/:id", async (req, res) => {
    try {
      const { tags, ...templateData } = req.body;
      
      const template = await storage.updatePosterTemplate(req.params.id, templateData);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      if (tags && Array.isArray(tags)) {
        await storage.deleteTagsByTemplate(template.id);
        for (const tag of tags) {
          await storage.createPosterTemplateTag({
            templateId: template.id,
            tag,
          });
        }
      }
      
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/poster-templates/:id", async (req, res) => {
    try {
      await storage.deletePosterTemplate(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/poster-templates/:id/tags", async (req, res) => {
    try {
      const tags = await storage.getTagsByTemplate(req.params.id);
      res.json(tags);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const bcrypt = (await import("bcrypt")).default;
      const { fullName, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        username: email,
        fullName: fullName,
        passwordHash: hashedPassword,
      });

      res.json({ success: true, userId: user.id });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const bcrypt = (await import("bcrypt")).default;
      const { email, password } = req.body;

      const user = await storage.getUserByUsername(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // In production, use proper JWT tokens
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

      res.json({ 
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      // Check token from Authorization header
      const auth = req.headers.authorization;
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const token = auth.replace('Bearer ', '');
      const decoded = Buffer.from(token, 'base64').toString();
      const [userId] = decoded.split(':');

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
      });
    } catch (error: any) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/username/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updateSchema = z.object({
        username: z.string().optional(),
        email: z.string().email().optional(),
        displayName: z.string().optional(),
        bio: z.string().optional(),
        avatarUrl: z.string().optional(),
        language: z.enum(["en", "es", "fr", "de", "ja"]).optional(),
        isDisabled: z.coerce.number().optional(),
      });
      const validatedData = updateSchema.parse(req.body);
      const user = await storage.updateUser(req.params.id, validatedData);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/users/:id/password", async (req, res) => {
    try {
      const passwordSchema = z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      });
      const validatedData = passwordSchema.parse(req.body);
      
      const success = await storage.changeUserPassword(
        req.params.id,
        validatedData.currentPassword,
        validatedData.newPassword
      );
      
      if (!success) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/users/:id/disable", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, { isDisabled: 1 });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Achievement routes
  app.post("/api/achievements", async (req, res) => {
    try {
      const validatedData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(validatedData);
      res.status(201).json(achievement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users/:userId/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievementsByUser(req.params.userId);
      res.json(achievements);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Team profile routes
  app.post("/api/team-profiles", async (req, res) => {
    try {
      const validatedData = insertTeamProfileSchema.parse(req.body);
      const teamProfile = await storage.createTeamProfile(validatedData);
      res.status(201).json(teamProfile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/team-profiles/:id", async (req, res) => {
    try {
      const teamProfile = await storage.getTeamProfile(req.params.id);
      if (!teamProfile) {
        return res.status(404).json({ error: "Team profile not found" });
      }
      res.json(teamProfile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/:ownerId/team-profiles", async (req, res) => {
    try {
      const teamProfiles = await storage.getTeamProfilesByOwner(req.params.ownerId);
      res.json(teamProfiles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/team-profiles/:id", async (req, res) => {
    try {
      const teamProfile = await storage.updateTeamProfile(req.params.id, req.body);
      if (!teamProfile) {
        return res.status(404).json({ error: "Team profile not found" });
      }
      res.json(teamProfile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/team-profiles/:id", async (req, res) => {
    try {
      await storage.deleteTeamProfile(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Team member routes
  app.post("/api/team-profiles/:teamId/members", async (req, res) => {
    try {
      const validatedData = insertTeamMemberSchema.parse({
        ...req.body,
        teamId: req.params.teamId,
      });
      const member = await storage.createTeamMember(validatedData);
      res.status(201).json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/team-profiles/:teamId/members", async (req, res) => {
    try {
      const members = await storage.getMembersByTeam(req.params.teamId);
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/team-profiles/:teamId/members/:userId", async (req, res) => {
    try {
      await storage.deleteMemberFromTeam(req.params.teamId, req.params.userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Server member routes
  app.post("/api/servers/:serverId/members", async (req, res) => {
    try {
      const validatedData = insertServerMemberSchema.parse({
        ...req.body,
        serverId: req.params.serverId,
      });
      const member = await storage.createServerMember(validatedData);
      res.status(201).json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/servers/:serverId/members", async (req, res) => {
    try {
      const members = await storage.getMembersByServer(req.params.serverId);
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/servers/:serverId/members/:userId", async (req, res) => {
    try {
      const member = await storage.getServerMemberByUserId(req.params.serverId, req.params.userId);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(member);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/servers/:serverId/members/:userId", async (req, res) => {
    try {
      const updateSchema = z.object({
        roleId: z.string().optional(),
        customTitle: z.string().optional(),
        explicitPermissions: z.array(z.string()).optional(),
      });
      const validatedData = updateSchema.parse(req.body);
      const member = await storage.updateServerMember(
        req.params.serverId,
        req.params.userId,
        validatedData
      );
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/servers/:serverId/members/:userId", async (req, res) => {
    try {
      await storage.deleteMemberFromServer(req.params.serverId, req.params.userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Object Storage Routes - Reference: blueprint:javascript_object_storage
  // Serve uploaded objects (with ACL check)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      
      // Check ACL policy - only serve public files
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        requestedPermission: ObjectPermission.READ,
      });
      
      if (!canAccess) {
        return res.sendStatus(403);
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get presigned URL for uploading
  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Normalize tournament poster path after upload and set ACL policy
  app.put("/api/tournament-posters", async (req, res) => {
    if (!req.body.posterURL) {
      return res.status(400).json({ error: "posterURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      // Set ACL policy for public access (tournament posters are public)
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.posterURL,
        {
          owner: "system",
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error: any) {
      console.error("Error setting tournament poster:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Normalize avatar path after upload and set ACL policy
  app.put("/api/avatars", async (req, res) => {
    if (!req.body.avatarURL) {
      return res.status(400).json({ error: "avatarURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.avatarURL,
        {
          owner: req.body.userId || "system",
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error: any) {
      console.error("Error setting avatar:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Channel category routes
  app.post("/api/servers/:serverId/categories", async (req, res) => {
    try {
      const validatedData = insertChannelCategorySchema.parse({
        serverId: req.params.serverId,
        name: req.body.name,
        position: req.body.position,
      });
      const category = await storage.createChannelCategory(validatedData);
      res.status(201).json(category);
    } catch (error: any) {
      console.error("Error creating category:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/servers/:serverId/categories", async (req, res) => {
    try {
      const categories = await storage.getCategoriesByServer(req.params.serverId);
      res.status(200).json(categories);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const updateSchema = z.object({
        name: z.string().optional(),
        position: z.number().optional(),
      });
      const validatedData = updateSchema.parse(req.body);
      const category = await storage.updateChannelCategory(req.params.id, validatedData);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(200).json(category);
    } catch (error: any) {
      console.error("Error updating category:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      await storage.deleteChannelCategory(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Channel update/delete routes
  app.patch("/api/channels/:id", async (req, res) => {
    try {
      const updateSchema = z.object({
        name: z.string().optional(),
        categoryId: z.string().nullable().optional(),
        position: z.number().optional(),
        icon: z.string().optional(),
      });
      const validatedData = updateSchema.parse(req.body);
      const channel = await storage.updateChannel(req.params.id, validatedData);
      if (!channel) {
        return res.status(404).json({ error: "Channel not found" });
      }
      res.status(200).json(channel);
    } catch (error: any) {
      console.error("Error updating channel:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/channels/:id", async (req, res) => {
    try {
      await storage.deleteChannel(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting channel:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Channel message routes
  app.get("/api/channels/:channelId/messages", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const messages = await storage.getChannelMessages(req.params.channelId, limit);
      res.status(200).json(messages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/channels/:channelId/messages", async (req, res) => {
    try {
      const validatedData = insertChannelMessageSchema.parse({
        channelId: req.params.channelId,
        userId: req.body.userId,
        username: req.body.username,
        message: req.body.message,
        imageUrl: req.body.imageUrl,
        fileUrl: req.body.fileUrl,
        fileName: req.body.fileName,
        replyToId: req.body.replyToId,
      });
      const message = await storage.createChannelMessage(validatedData);
      res.status(201).json(message);
    } catch (error: any) {
      console.error("Error creating message:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/messages/:id", async (req, res) => {
    try {
      await storage.deleteChannelMessage(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting message:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Server role routes
  app.post("/api/servers/:serverId/roles", async (req, res) => {
    try {
      const validatedData = insertServerRoleSchema.parse({
        serverId: req.params.serverId,
        name: req.body.name,
        color: req.body.color,
        permissions: req.body.permissions,
        position: req.body.position,
      });
      const role = await storage.createServerRole(validatedData);
      res.status(201).json(role);
    } catch (error: any) {
      console.error("Error creating role:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/servers/:serverId/roles", async (req, res) => {
    try {
      const roles = await storage.getRolesByServer(req.params.serverId);
      res.status(200).json(roles);
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/roles/:id", async (req, res) => {
    try {
      const updateSchema = z.object({
        name: z.string().optional(),
        color: z.string().optional(),
        permissions: z.array(z.string()).optional(),
        position: z.number().optional(),
      });
      const validatedData = updateSchema.parse(req.body);
      const role = await storage.updateServerRole(req.params.id, validatedData);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.status(200).json(role);
    } catch (error: any) {
      console.error("Error updating role:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/roles/:id", async (req, res) => {
    try {
      await storage.deleteServerRole(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting role:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Server ban routes
  app.post("/api/servers/:serverId/bans", async (req, res) => {
    try {
      const validatedData = insertServerBanSchema.parse({
        serverId: req.params.serverId,
        userId: req.body.userId,
        reason: req.body.reason,
        bannedBy: req.body.bannedBy,
      });
      const ban = await storage.createServerBan(validatedData);
      res.status(201).json(ban);
    } catch (error: any) {
      console.error("Error creating ban:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/servers/:serverId/bans", async (req, res) => {
    try {
      const bans = await storage.getBansByServer(req.params.serverId);
      res.status(200).json(bans);
    } catch (error: any) {
      console.error("Error fetching bans:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/servers/:serverId/bans/:userId", async (req, res) => {
    try {
      await storage.deleteBan(req.params.serverId, req.params.userId);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting ban:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Server invite routes
  app.post("/api/servers/:serverId/invites", async (req, res) => {
    try {
      const code = Math.random().toString(36).substring(2, 10);
      const validatedData = insertServerInviteSchema.parse({
        serverId: req.params.serverId,
        code,
        createdBy: req.body.createdBy,
        expiresAt: req.body.expiresAt,
        maxUses: req.body.maxUses,
      });
      const invite = await storage.createServerInvite(validatedData);
      res.status(201).json(invite);
    } catch (error: any) {
      console.error("Error creating invite:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/servers/:serverId/invites", async (req, res) => {
    try {
      const invites = await storage.getInvitesByServer(req.params.serverId);
      res.status(200).json(invites);
    } catch (error: any) {
      console.error("Error fetching invites:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/invites/:code", async (req, res) => {
    try {
      const invite = await storage.getInviteByCode(req.params.code);
      if (!invite) {
        return res.status(404).json({ error: "Invite not found" });
      }
      res.status(200).json(invite);
    } catch (error: any) {
      console.error("Error fetching invite:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/invites/:code/use", async (req, res) => {
    try {
      const invite = await storage.getInviteByCode(req.params.code);
      if (!invite) {
        return res.status(404).json({ error: "Invite not found" });
      }
      
      if (invite.maxUses && (invite.currentUses || 0) >= invite.maxUses) {
        return res.status(400).json({ error: "Invite has reached maximum uses" });
      }
      
      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Invite has expired" });
      }

      await storage.incrementInviteUse(req.params.code);
      await storage.joinServer(invite.serverId, req.body.userId);
      res.status(200).json({ success: true, serverId: invite.serverId });
    } catch (error: any) {
      console.error("Error using invite:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/invites/:id", async (req, res) => {
    try {
      await storage.deleteInvite(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting invite:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Server update route
  app.patch("/api/servers/:id", async (req, res) => {
    try {
      const updateSchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        iconUrl: z.string().optional(),
        backgroundUrl: z.string().optional(),
        category: z.string().optional(),
        gameTags: z.array(z.string()).optional(),
        isPublic: z.number().optional(),
      });
      const validatedData = updateSchema.parse(req.body);
      const server = await storage.updateServer(req.params.id, validatedData);
      if (!server) {
        return res.status(404).json({ error: "Server not found" });
      }
      res.status(200).json(server);
    } catch (error: any) {
      console.error("Error updating server:", error);
      res.status(400).json({ error: error.message });
    }
  });

  return httpServer;
}
