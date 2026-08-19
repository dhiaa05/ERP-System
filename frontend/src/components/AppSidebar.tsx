'use client';

import { useAuthStore } from '@/lib/store/auth';
import { Package2, LayoutDashboard, ShoppingCart, Users, Settings, Package, Truck, LogOut, TrendingUp, Megaphone, Receipt, BarChart3, MapPin } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Marketing', href: '/marketing', icon: Megaphone },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Leaderboard', href: '/leaderboard', icon: TrendingUp },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 flex items-center justify-center px-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Package2 className="h-6 w-6 text-primary" />
          <span className="text-lg">Lamsti OS</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      isActive={isActive} 
                      tooltip={item.name}
                      render={<Link href={item.href} />}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" render={<Link href="/settings" />}>
                  <Settings className="h-4 w-4" />
                  <span>Paramètres</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Wilayas (Shipping)" render={<Link href="/settings/wilayas" />}>
                  <MapPin className="h-4 w-4" />
                  <span>Prix Livraison</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md hover:bg-muted p-2 outline-none">
            <Avatar className="h-8 w-8 rounded-md">
              <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col text-left text-sm">
              <span className="font-medium truncate">{user?.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.role}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
