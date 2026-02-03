import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import {
    Users,
    MapPin,
    Building,
    Wrench,
    LogOut,
    Home,
    Settings,
    Shield,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile: any;
    onLogout: () => void;
    onHomeConfig: () => void;
}

export default function AdminSidebar({
    activeTab,
    setActiveTab,
    profile,
    onLogout,
    onHomeConfig,
}: AdminSidebarProps) {
    return (
        <Sidebar className="bg-sidebar border-r border-sidebar-border" collapsible="icon">
            <SidebarHeader className="p-4 border-b border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-2 px-2 py-1">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                                <span className="font-bold text-foreground tracking-tight">
                                    Admin Panel
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                    Management
                                </span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="p-2">
                <SidebarGroup>
                    <SidebarGroupLabel>Adatkezelés</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'users'}
                                    onClick={() => setActiveTab('users')}
                                    tooltip="Felhasználók"
                                    className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                                >
                                    <Users className="h-4 w-4" />
                                    <span>Felhasználók</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'parking'}
                                    onClick={() => setActiveTab('parking')}
                                    tooltip="Bicikli Parkolók"
                                    className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                                >
                                    <MapPin className="h-4 w-4" />
                                    <span>Bicikli Parkolók</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'services'}
                                    onClick={() => setActiveTab('services')}
                                    tooltip="Szervizek & Boltok"
                                    className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                                >
                                    <Building className="h-4 w-4" />
                                    <span>Szervizek & Boltok</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === 'repair'}
                                    onClick={() => setActiveTab('repair')}
                                    tooltip="Javító Állomások"
                                    className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                                >
                                    <Wrench className="h-4 w-4" />
                                    <span>Javító Állomások</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="my-2" />

                <SidebarGroup>
                    <SidebarGroupLabel>Egyéb</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip="Vissza a főoldalra"
                                    onClick={onHomeConfig}
                                >
                                    <Home className="h-4 w-4" />
                                    <span>Vissza a főoldalra</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Beállítások">
                                    <Settings className="h-4 w-4" />
                                    <span>Beállítások</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar-accent/5">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
                        <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                            <AvatarImage
                                src={profile?.avatar_url}
                                alt={profile?.username || 'Admin'}
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {(profile?.username || profile?.email || 'A')
                                    .charAt(0)
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                            <p className="text-sm font-medium text-foreground truncate">
                                {profile?.username || 'Admin'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {profile?.email}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border/50 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                        onClick={onLogout}
                    >
                        <LogOut className="h-4 w-4 mr-2 group-data-[collapsible=icon]:mr-0" />
                        <span className="group-data-[collapsible=icon]:hidden">
                            Kijelentkezés
                        </span>
                    </Button>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
