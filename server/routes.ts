import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import {
  insertTournamentSchema,
  insertTeamSchema,
  insertMatchSchema,
  insertChatMessageSchema,
} from "@shared/schema";
import {
  generateRoundRobinBracket,
  generateSingleEliminationBracket,
  generateSwissSystemRound,
} from "./bracket-generator";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer });

  const matchConnections = new Map<string, Set<WebSocket>>();

  wss.on("connection", (ws, req) => {
    const matchId = new URL(req.url || "", `http://${req.headers.host}`).searchParams.get("matchId");

    if (matchId) {
      if (!matchConnections.has(matchId)) {
        matchConnections.set(matchId, new Set());
      }
      matchConnections.get(matchId)!.add(ws);

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

  app.post("/api/tournaments", async (req, res) => {
    try {
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

      res.status(201).json(tournament);
    } catch (error: any) {
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

  return httpServer;
}
