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
      <Route path="/" component={MobilePreviewHome} />
      <Route path="/discovery" component={MobilePreviewServers} />
      <Route path="/messages" component={MobilePreviewMessages} />
      <Route path="/notifications" component={MobilePreviewNotifications} />
      <Route path="/myservers" component={MobilePreviewMyServers} />
      <Route path="/server/:serverId" component={MobilePreviewServerDetail} />
      <Route path="/account" component={MobilePreviewAccount} />
      
      <Route path="/preview/home" component={PreviewHome} />
      <Route path="/preview/discovery" component={PreviewDiscovery} />
      <Route path="/preview/messages" component={PreviewMessages} />
      <Route path="/preview/my-servers" component={PreviewMyServers} />
      <Route path="/preview/server/:serverId" component={PreviewServerDetail} />
      <Route path="/preview/account" component={PreviewAccount} />
      <Route path="/preview/poster-builder" component={PreviewPosterBuilder} />
      
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
    
    // Enable dark mode by default for 10 on 10 theme
    document.documentElement.classList.add('dark');
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
