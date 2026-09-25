import { Link, useMatchRoute } from "@tanstack/react-router";
import { NavUser } from "@/components/layout/nav-user";
import { LogoMark } from "@/components/logo-mark";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { navGroups, type NavItem } from "@/config/navigation";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                {/* `!` because the menu button pins every icon inside it to 16px. */}
                <LogoMark className="size-8!" />
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-heading text-base font-extrabold">
                    Globa<span className="text-primary">GRID</span>
                  </span>
                  <span className="truncate text-xs text-muted-foreground">Admin panel</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <NavEntry key={item.label} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function NavEntry({ item }: { item: NavItem }) {
  const matchRoute = useMatchRoute();
  const { isMobile, setOpenMobile } = useSidebar();
  const Icon = item.icon;

  if ("soon" in item) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton disabled>
          <Icon />
          <span>{item.label}</span>
        </SidebarMenuButton>
        <SidebarMenuBadge>Soon</SidebarMenuBadge>
      </SidebarMenuItem>
    );
  }

  // Every page sits under `/`, so the dashboard lights up only on its own.
  const isActive = Boolean(matchRoute({ to: item.to, fuzzy: item.to !== "/" }));

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <Link to={item.to} onClick={() => isMobile && setOpenMobile(false)}>
          <Icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
