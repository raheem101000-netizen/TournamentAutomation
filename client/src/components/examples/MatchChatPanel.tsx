import { useState } from "react";
import MatchChatPanel from '../MatchChatPanel';

export default function MatchChatPanelExample() {
  const teams = [
    { id: "1", name: "Alpha Squad", tournamentId: "t1", wins: 2, losses: 0, points: 6 },
    { id: "2", name: "Beta Force", tournamentId: "t1", wins: 1, losses: 1, points: 3 },
  ];

  const [messages, setMessages] = useState([
    {
      id: "1",
      matchId: "m1",
      teamId: null,
      message: "Match started",
      isSystem: 1,
      createdAt: new Date(),
    },
    {
      id: "2",
      matchId: "m1",
      teamId: "1",
      message: "GL HF!",
      isSystem: 0,
      createdAt: new Date(),
    },
    {
      id: "3",
      matchId: "m1",
      teamId: "2",
      message: "Good luck, have fun!",
      isSystem: 0,
      createdAt: new Date(),
    },
  ]);

  const handleSendMessage = (message: string) => {
    const newMessage = {
      id: `${messages.length + 1}`,
      matchId: "m1",
      teamId: "1",
      message,
      isSystem: 0,
      createdAt: new Date(),
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="h-[600px]">
      <MatchChatPanel 
        messages={messages}
        teams={teams}
        currentTeamId="1"
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
