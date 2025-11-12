import { useEffect, useState } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import TournamentDetail from "@/pages/TournamentDetail";
import RegistrationDemo from "@/pages/RegistrationDemo";
import TournamentRegistration from "@/pages/TournamentRegistration";
import ProfilePage from "@/pages/profile";
import MessagingPage from "@/pages/messaging";
import DiscoveryPage from "@/pages/discovery";
import NotificationsPage from "@/pages/notifications";
import { Trophy, User, MessageCircle, Search, Bell, Home } from "lucide-react";
import { initializeApp } from "../../lib/initializeApp";

const tournamentItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Registration Demo", url: "/registration-demo", icon: Trophy },
];

const socialItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Messages", url: "/messages", icon: MessageCircle },
  { title: "Discovery", url: "/discover", icon: Search },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tournament Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tournamentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Social Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {socialItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/tournament/:id" component={TournamentDetail} />
      <Route path="/register/:id" component={TournamentRegistration} />
      <Route path="/registration-demo" component={RegistrationDemo} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/messages" component={MessagingPage} />
      <Route path="/discover" component={DiscoveryPage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      await initializeApp();
      setIsInitialized(true);
    }
    init();
  }, []);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Initializing...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-2 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h1 className="text-lg font-semibold">Tournament Platform</h1>
                <div className="w-9" />
              </header>
              <main className="flex-1 overflow-hidden">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
