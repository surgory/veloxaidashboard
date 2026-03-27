import { LayoutDashboard, Key, ClipboardList, ScrollText, Ban, Users, Settings, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Generate Keys", url: "/generate", icon: Key },
  { title: "All Licenses", url: "/licenses", icon: ClipboardList },
  { title: "Activation Logs", url: "/logs", icon: ScrollText },
  { title: "Banned HWIDs", url: "/banned", icon: Ban },
  { title: "Admins", url: "/admins", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Alerts", url: "/alerts", icon: Bell },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

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
              {navItems.map((item) => {
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

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-foreground text-xs font-medium">A</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">Admin</p>
              <p className="text-[10px] text-muted-foreground truncate">admin@veloxai.site</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
