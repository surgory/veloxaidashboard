import { useEffect, useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { Key, Shield, Crown, Clock, Users, Activity, DollarSign, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { supabase } from "@/lib/supabase";

interface Metrics {
  totalLicenses: number;
  activeLicenses: number;
  lifetimeKeys: number;
  premiumKeys: number;
  trialKeys: number;
  totalUsers: number;
  activationsToday: number;
  revokedKeys: number;
}

export default function DashboardHome() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalLicenses: 0, activeLicenses: 0, lifetimeKeys: 0, premiumKeys: 0,
    trialKeys: 0, totalUsers: 0, activationsToday: 0, revokedKeys: 0,
  });
  const [activationData, setActivationData] = useState<{ day: string; activations: number }[]>([]);
  const [licenseDistribution, setLicenseDistribution] = useState<{ name: string; value: number; color: string }[]>([]);
  const [topUsers, setTopUsers] = useState<{ name: string; activations: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [licensesRes, logsRes] = await Promise.all([
        supabase.from("licenses").select("*"),
        supabase.from("activation_logs").select("*"),
      ]);

      const licenses = licensesRes.data || [];
      const logs = logsRes.data || [];

      const total = licenses.length;
      const active = licenses.filter(l => l.status === "active").length;
      const lifetime = licenses.filter(l => l.type === "lifetime").length;
      const premium = licenses.filter(l => l.type === "premium").length;
      const trial = licenses.filter(l => l.type === "trial").length;
      const revoked = licenses.filter(l => l.status === "revoked").length;

      const uniqueOwners = new Set(licenses.map(l => l.owner_name).filter(Boolean)).size;

      const today = new Date().toISOString().split("T")[0];
      const todayLogs = logs.filter(l => l.created_at?.startsWith(today)).length;

      setMetrics({
        totalLicenses: total,
        activeLicenses: active,
        lifetimeKeys: lifetime,
        premiumKeys: premium,
        trialKeys: trial,
        totalUsers: uniqueOwners,
        activationsToday: todayLogs,
        revokedKeys: revoked,
      });

      // License distribution for pie chart
      setLicenseDistribution([
        { name: "Premium", value: premium, color: "#ffffff" },
        { name: "Trial", value: trial, color: "#888888" },
        { name: "Lifetime", value: lifetime, color: "#444444" },
      ]);

      // Activations over last 30 days
      const last30 = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toISOString().split("T")[0];
      });

      const logsByDay = last30.map(day => ({
        day: day.slice(5), // MM-DD
        activations: logs.filter(l => l.created_at?.startsWith(day)).length,
      }));
      setActivationData(logsByDay);

      // Top users by activations (by license key)
      const keyCount: Record<string, number> = {};
      logs.forEach(l => {
        if (l.license_key) keyCount[l.license_key] = (keyCount[l.license_key] || 0) + 1;
      });
      const top = Object.entries(keyCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, activations]) => ({ name, activations }));
      setTopUsers(top);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-5 h-28 skeleton-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your license management system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Licenses" value={metrics.totalLicenses} icon={Key} change={`${metrics.activeLicenses} active`} changeType="positive" />
        <MetricCard title="Active Licenses" value={metrics.activeLicenses} icon={Shield} change={metrics.totalLicenses > 0 ? `${((metrics.activeLicenses / metrics.totalLicenses) * 100).toFixed(1)}% active rate` : "No licenses yet"} changeType="positive" />
        <MetricCard title="Lifetime Keys" value={metrics.lifetimeKeys} icon={Crown} change="Never expire" changeType="neutral" />
        <MetricCard title="Premium Keys" value={metrics.premiumKeys} icon={Zap} change="365-day licenses" changeType="neutral" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Trial Keys" value={metrics.trialKeys} icon={Clock} change="30-day licenses" changeType="neutral" />
        <MetricCard title="Unique Owners" value={metrics.totalUsers} icon={Users} changeType="neutral" />
        <MetricCard title="Activations Today" value={metrics.activationsToday} icon={Activity} changeType="positive" />
        <MetricCard title="Revoked Keys" value={metrics.revokedKeys} icon={DollarSign} changeType="negative" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-display">Activations (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {activationData.some(d => d.activations > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="day" stroke="#555" fontSize={11} />
                  <YAxis stroke="#555" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "6px", color: "#fff", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="activations" stroke="#fff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">No activation data yet</div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-display">License Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {licenseDistribution.some(d => d.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={licenseDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {licenseDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "6px", color: "#fff", fontSize: "12px" }} />
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
              </>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">No licenses yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display">Top Keys by Activations</CardTitle>
        </CardHeader>
        <CardContent>
          {topUsers.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topUsers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#555" fontSize={11} />
                <YAxis stroke="#555" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "6px", color: "#fff", fontSize: "12px" }} />
                <Bar dataKey="activations" fill="#888" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">No activation data yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
