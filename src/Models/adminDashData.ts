export interface DashboardData {
  totalRevenue: number;
  totalBookings: number;
  userData: number;
  department: {
    flights: number;
    hotels: number;
    tours: number;
  };
  monthlyGraph: Array<{ day: number; bookings: number; revenue: number }>;
}