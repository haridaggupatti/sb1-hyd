import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, Shield } from 'lucide-react';
import { adminApi } from '../../services/api';

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: adminApi.getStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading || !stats) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="bg-gray-200 h-8 w-24 rounded"></div>
                <div className="mt-3 bg-gray-200 h-6 w-16 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Users',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Admin Users',
      value: stats.adminUsers,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${card.bgColor} rounded-md p-3`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                    <dd className="text-lg font-semibold text-gray-900">{card.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Login Activity</h3>
          <div className="space-y-4">
            {stats.recentLogins.map((login, index) => (
              <div key={login.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{login.date}</span>
                <div className="flex-1 mx-4">
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 bg-indigo-600 rounded-full"
                      style={{
                        width: `${(login.count / Math.max(...stats.recentLogins.map(l => l.count))) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{login.count} logins</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}