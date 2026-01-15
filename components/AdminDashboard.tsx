"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, MapPin } from "lucide-react";
import AdminUsersTab from "./AdminUsersTab";
import AdminBookingsTab from "./AdminBookingsTab";
import AdminSchedulesTab from "./AdminSchedulesTab";

interface User {
  id: string;
  name: string | null;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
  _count: {
    bookings: number;
  };
}

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shoeType: string;
  serviceType: string;
  status: string;
  scheduledDate: Date;
  createdAt: Date;
  collectionRequired: boolean;
  collectionAddress: string | null;
  collectionCity: string | null;
  collectionPostcode: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface Stat {
  status: string;
  _count: {
    id: number;
  };
}

export default function AdminDashboard({
  initialUsers,
  initialBookings,
  stats,
}: {
  initialUsers: User[];
  initialBookings: Booking[];
  stats: Stat[];
}) {
  return (
    <Tabs defaultValue="bookings" className="w-full">
      <div className="mb-8">
        <TabsList className="inline-flex h-11 w-full bg-muted/30 p-1 rounded-lg border">
          <TabsTrigger
            value="bookings"
            className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold rounded-md transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/80"
          >
            <Calendar className="h-4 w-4" />
            <span>Bookings</span>
          </TabsTrigger>
          <TabsTrigger
            value="schedules"
            className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold rounded-md transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/80"
          >
            <MapPin className="h-4 w-4" />
            <span>Schedules</span>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold rounded-md transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/80"
          >
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="bookings" className="mt-0">
        <AdminBookingsTab initialBookings={initialBookings} stats={stats} />
      </TabsContent>

      <TabsContent value="schedules" className="mt-0">
        <AdminSchedulesTab />
      </TabsContent>

      <TabsContent value="users" className="mt-0">
        <AdminUsersTab initialUsers={initialUsers} />
      </TabsContent>
    </Tabs>
  );
}
