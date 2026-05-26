export interface HotelManDashboardData {
  totalBookings: number;
  totalRevenue: number;
  monthlyGraphData:[{
    day: number;
    bookings: number;
    revenue: number;
}];
}