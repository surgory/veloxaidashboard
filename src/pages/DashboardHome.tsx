import { MetricCard } from "@/components/MetricCard";
import { Key, Shield, Crown, Clock, Users, Activity, DollarSign, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const activationData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  activations: Math.floor(Math.random() * 40) + 5,
}));

const licenseDistribution = [
  { name: "Premium", value: 245, color: "#ffffff" },
  { name: "Trial", value: 120, color: "#888888" },
  { name: "Lifetime", value: 58, color: "#444444" },
];

const topUsers = [
  { name: "User_7K3M", activations: 34 },
  { name: "User_9P2X", activations: 28 },
  { name: "User_4H8N", activations: 22 },
  { name: "User_1L5R", activations: 18 },
  { name: "User_6W9T", activations: 15 },
];

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your license management system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Licenses" value="423" icon={Key} change="+12 this week" changeType="positive" />
        <MetricCard title="Active Licenses" value="367" icon={Shield} change="86.7% active rate" changeType="positive" />
        <MetricCard title="Lifetime Keys" value="58" icon={Crown} change="+3 this month" changeType="positive" />
        <MetricCard title="Premium Keys" value="245" icon={Zap} change="365-day licenses" changeType="neutral" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Trial Keys" value="120" icon={Clock} change="30-day licenses" changeType="neutral" />
        <MetricCard title="Total Users" value="312" icon={Users} change="+8 today" changeType="positive" />
        <MetricCard title="Activations Today" value="24" icon={Activity} change="+15% vs yesterday" changeType="positive" />
        <MetricCard title="Revenue" value="$12,450" icon={DollarSign} change="+$1,200 this week" changeType="positive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-display">Activations (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="day" stroke="#555" fontSize={11} />
                <YAxis stroke="#555" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid #333",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="activations" stroke="#fff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-display">License Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={licenseDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {licenseDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid #333",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              {licenseDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display">Top Users by Activations</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="name" stroke="#555" fontSize={11} />
              <YAxis stroke="#555" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111",
                  border: "1px solid #333",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="activations" fill="#888" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
