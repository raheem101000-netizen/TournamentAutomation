import { useEffect, useState } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";
import MobilePreviewHome from "@/pages/mobile-preview-home";
import MobilePreviewServers from "@/pages/mobile-preview-servers";
import MobilePreviewMessages from "@/pages/mobile-preview-messages";
import MobilePreviewNotifications from "@/pages/mobile-preview-notifications";
import MobilePreviewMyServers from "@/pages/mobile-preview-myservers";
import MobilePreviewServerDetail from "@/pages/mobile-preview-server-detail";
import MobilePreviewAccount from "@/pages/mobile-preview-account";
import PreviewHome from "@/pages/preview-home";
import PreviewDiscovery from "@/pages/preview-discovery";
import PreviewMessages from "@/pages/preview-messages";
import PreviewMyServers from "@/pages/preview-my-servers";
import PreviewServerDetail from "@/pages/preview-server-detail";
import PreviewAccount from "@/pages/preview-account";
import PreviewPosterBuilder from "@/pages/preview-poster-builder";
import PreviewCreateTeam from "@/pages/preview-create-team";
import PreviewOrganizerAward from "@/pages/preview-organizer-award";
import PreviewTemplates from "@/pages/preview-templates";
import PreviewAdminTemplates from "@/pages/preview-admin-templates";
import { User, Search, Bell, Trophy, Server, MessageSquare } from "lucide-react";
import { initializeApp } from "../../lib/initializeApp";

const appItems = [
  { title: "Home", url: "/", icon: Trophy },
  { title: "Discovery", url: "/discovery", icon: Search },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "My Servers", url: "/myservers", icon: Server },
  { title: "Account", url: "/account", icon: User },
];

function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>10 on 10</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {appItems.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={PreviewHome} />
      <Route path="/discovery" component={PreviewDiscovery} />
      <Route path="/messages" component={PreviewMessages} />
      <Route path="/myservers" component={PreviewMyServers} />
      <Route path="/server/:serverId" component={PreviewServerDetail} />
      <Route path="/account" component={PreviewAccount} />
      <Route path="/poster-builder" component={PreviewPosterBuilder} />
      <Route path="/create-team" component={PreviewCreateTeam} />
      <Route path="/organizer-award" component={PreviewOrganizerAward} />
      <Route path="/templates" component={PreviewTemplates} />
      <Route path="/admin/templates" component={PreviewAdminTemplates} />
      
      <Route path="/old" component={MobilePreviewHome} />
      <Route path="/old/discovery" component={MobilePreviewServers} />
      <Route path="/old/messages" component={MobilePreviewMessages} />
      <Route path="/old/notifications" component={MobilePreviewNotifications} />
      <Route path="/old/myservers" component={MobilePreviewMyServers} />
      <Route path="/old/server/:serverId" component={MobilePreviewServerDetail} />
      <Route path="/old/account" component={MobilePreviewAccount} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Temporarily skip initialization for testing
    // initializeApp();
    
    // Enable dark mode by default for 10 on 10 theme
    document.documentElement.classList.add('dark');
  }, []);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-2 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h1 className="text-lg font-semibold">10 on 10</h1>
                <div className="w-9" />
              </header>
              <main className="flex-1 overflow-y-auto">
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
