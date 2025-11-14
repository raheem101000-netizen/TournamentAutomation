import { db } from "./db";
import { servers, messageThreads, notifications } from "@shared/schema";

async function seedMobilePreview() {
  console.log("Seeding mobile preview data...");

  // Seed servers
  await db.insert(servers).values([
    {
      name: "Pro League Tournament",
      description: "Official tournament league for professional players",
      memberCount: 1247,
      category: "Competitive",
      isPublic: 1,
    },
    {
      name: "Casual Gaming Hub",
      description: "Relaxed community for casual matches",
      memberCount: 856,
      category: "Casual",
      isPublic: 1,
    },
    {
      name: "Esports Academy",
      description: "Training ground for aspiring esports athletes",
      memberCount: 432,
      category: "Training",
      isPublic: 1,
    },
    {
      name: "Weekend Warriors",
      description: "Weekend tournaments and friendly matches",
      memberCount: 623,
      category: "Community",
      isPublic: 1,
    },
    {
      name: "Championship Series",
      description: "High-stakes competitive championship",
      memberCount: 2104,
      category: "Competitive",
      isPublic: 1,
    },
  ]);

  // Seed message threads
  const now = new Date();
  await db.insert(messageThreads).values([
    {
      participantName: "Team Alpha",
      participantAvatar: "",
      lastMessage: "GG! See you in the finals",
      lastMessageTime: new Date(now.getTime() - 1000 * 60 * 5), // 5 minutes ago
      unreadCount: 2,
    },
    {
      participantName: "Jordan Smith",
      participantAvatar: "",
      lastMessage: "When is our next match?",
      lastMessageTime: new Date(now.getTime() - 1000 * 60 * 30), // 30 minutes ago
      unreadCount: 0,
    },
    {
      participantName: "Team Phoenix",
      participantAvatar: "",
      lastMessage: "Let's practice tomorrow",
      lastMessageTime: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 1,
    },
    {
      participantName: "Sarah Connor",
      participantAvatar: "",
      lastMessage: "Tournament starts at 3pm",
      lastMessageTime: new Date(now.getTime() - 1000 * 60 * 60 * 5), // 5 hours ago
      unreadCount: 0,
    },
    {
      participantName: "Team Dragons",
      participantAvatar: "",
      lastMessage: "Great game today!",
      lastMessageTime: new Date(now.getTime() - 1000 * 60 * 60 * 24), // 1 day ago
      unreadCount: 3,
    },
  ]);

  // Seed notifications
  await db.insert(notifications).values([
    {
      type: "match_result",
      title: "Match Result",
      message: "Team A won 2-1 in a thrilling match!",
      timestamp: new Date(now.getTime() - 1000 * 60 * 10), // 10 minutes ago
      isRead: 0,
    },
    {
      type: "friend_request",
      title: "Friend Request",
      message: "Alex Johnson sent you a friend request",
      timestamp: new Date(now.getTime() - 1000 * 60 * 45), // 45 minutes ago
      isRead: 0,
    },
    {
      type: "tournament_alert",
      title: "Tournament Alert: Summer Cup",
      message: "The Summer Cup registration is now open!",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 3), // 3 hours ago
      isRead: 0,
    },
    {
      type: "system",
      title: "New Message",
      message: "You have 3 unread messages",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 6), // 6 hours ago
      isRead: 1,
    },
    {
      type: "match_result",
      title: "Match Update",
      message: "Your team advanced to the semifinals",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 12), // 12 hours ago
      isRead: 0,
    },
    {
      type: "system",
      title: "System Update",
      message: "App updated to version 2.1.0",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      isRead: 1,
    },
  ]);

  console.log("Mobile preview data seeded successfully!");
}

seedMobilePreview()
  .catch((error) => {
    console.error("Error seeding mobile preview data:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
