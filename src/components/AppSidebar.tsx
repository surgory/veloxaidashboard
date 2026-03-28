import { LayoutDashboard, Key, ClipboardList, ScrollText, Ban, Users, Settings, Bell, LogOut, FileText } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, ownerOnly: false },
  { title: "Generate Keys", url: "/generate", icon: Key, ownerOnly: false },
  { title: "All Licenses", url: "/licenses", icon: ClipboardList, ownerOnly: false },
  { title: "Activation Logs", url: "/logs", icon: ScrollText, ownerOnly: false },
  { title: "Banned HWIDs", url: "/banned", icon: Ban, ownerOnly: false },
  { title: "Audit Log", url: "/audit", icon: FileText, ownerOnly: false },
  { title: "Admins", url: "/admins", icon: Users, ownerOnly: false },
  { title: "Settings", url: "/settings", icon: Settings, ownerOnly: false },
  { title: "Alerts", url: "/alerts", icon: Bell, ownerOnly: false },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { isOwner, discord, signOut } = useAuth();

  const visibleItems = navItems.filter(item => !item.ownerOnly || isOwner);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
            <span className="text-background font-display font-bold text-sm">V</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display text-base font-bold text-foreground">VeloxAI</h1>
              <p className="text-[10px] text-muted-foreground">License Manager</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.url}
                        end
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-sidebar-foreground hover:text-foreground hover:bg-accent"
                        activeClassName="bg-accent text-foreground font-medium border-l-2 border-foreground"
                      >
                        <item.icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border space-y-3">
        {!collapsed && discord && (
          <div className="flex items-center gap-3">
            {discord.avatar_url ? (
              <img src={discord.avatar_url} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <span className="text-foreground text-xs font-medium">
                  {discord.username[0]?.toUpperCase() || "?"}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">
                {isOwner ? "Owner" : "Admin"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{discord.username}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={signOut}
          className="w-full text-muted-foreground hover:text-foreground btn-click gap-2"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
