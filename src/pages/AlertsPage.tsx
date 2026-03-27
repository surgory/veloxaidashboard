import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Key, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { ActivationLog } from "@/lib/types";
import type { License } from "@/lib/types";

interface Alert {
  id: number;
  type: "critical" | "warning" | "success";
  icon: typeof Shield;
  title: string;
  description: string;
  time: string;
}

const alertStyles: Record<string, { badge: string; border: string; icon: string }> = {
  critical: { badge: "bg-foreground/10 text-foreground border-foreground/20", border: "border-l-foreground", icon: "text-foreground" },
  warning: { badge: "bg-foreground/5 text-foreground/70 border-foreground/10", border: "border-l-foreground/50", icon: "text-foreground/60" },
  success: { badge: "bg-foreground/5 text-foreground/50 border-foreground/10", border: "border-l-foreground/30", icon: "text-foreground/40" },
};

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function buildAlerts(logs: ActivationLog[], licenses: License[]): Alert[] {
  const alerts: Alert[] = [];
  const revokedKeys = new Set(licenses.filter(l => l.status === "revoked").map(l => l.key));

  // Group logs by license_key to detect patterns
  const logsByKey: Record<string, ActivationLog[]> = {};
  logs.forEach(log => {
    if (!logsByKey[log.license_key]) logsByKey[log.license_key] = [];
    logsByKey[log.license_key].push(log);
  });

  logs.forEach(log => {
    // Critical: attempts on revoked keys
    if (revokedKeys.has(log.license_key)) {
      alerts.push({
        id: log.id * 100 + 1,
        type: "critical",
        icon: Shield,
        title: "Revoked Key Used",
        description: `Attempt to use revoked key ${log.license_key} from HWID: ${log.hwid || "unknown"}`,
        time: timeAgo(log.created_at),
      });
      return;
    }

    // Warning: revoke_attempt actions
    if (log.action === "revoke_attempt") {
      alerts.push({
        id: log.id * 100 + 2,
        type: "warning",
        icon: AlertTriangle,
        title: "Revoke Attempt",
        description: `Revoke attempt on key ${log.license_key} from IP: ${log.ip || "unknown"}`,
        time: timeAgo(log.created_at),
      });
      return;
    }

    // Success: normal activations/validations
    if (log.action === "activate") {
      alerts.push({
        id: log.id * 100 + 3,
        type: "success",
        icon: CheckCircle,
        title: "New Activation",
        description: `Key ${log.license_key} activated from HWID: ${log.hwid || "unknown"}`,
        time: timeAgo(log.created_at),
      });
    } else if (log.action === "validate") {
      alerts.push({
        id: log.id * 100 + 4,
        type: "success",
        icon: Key,
        title: "Validation",
        description: `Key ${log.license_key} validated from HWID: ${log.hwid || "unknown"}`,
        time: timeAgo(log.created_at),
      });
    }
  });

  // Check for multiple failed attempts from same IP
  const ipCounts: Record<string, number> = {};
  logs.forEach(l => {
    if (l.ip) ipCounts[l.ip] = (ipCounts[l.ip] || 0) + 1;
  });
  Object.entries(ipCounts).forEach(([ip, count]) => {
    if (count >= 5) {
      alerts.push({
        id: Math.random() * 100000,
        type: "warning",
        icon: AlertTriangle,
        title: "Multiple Attempts",
        description: `${count} activation attempts from IP ${ip}`,
        time: "Recent",
      });
    }
  });

  return alerts;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    setLoading(true);
    const [logsRes, licensesRes] = await Promise.all([
      supabase.from("activation_logs").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("licenses").select("*"),
    ]);
    const built = buildAlerts(logsRes.data || [], licensesRes.data || []);
    setAlerts(built);
    setLoading(false);
  }

  const criticalCount = alerts.filter(a => a.type === "critical").length;
  const warningCount = alerts.filter(a => a.type === "warning").length;
  const successCount = alerts.filter(a => a.type === "success").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Security Alerts</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time monitoring from activation logs</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAlerts} disabled={loading} className="gap-2 btn-click">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Badge variant="outline" className="bg-foreground/10 text-foreground border-foreground/20 gap-1">
          <span className="w-2 h-2 rounded-full bg-foreground animate-pulse-glow" /> {criticalCount} Critical
        </Badge>
        <Badge variant="outline" className="bg-foreground/5 text-foreground/70 border-foreground/10 gap-1">
          <span className="w-2 h-2 rounded-full bg-foreground/50" /> {warningCount} Warnings
        </Badge>
        <Badge variant="outline" className="bg-foreground/5 text-foreground/50 border-foreground/10 gap-1">
          <span className="w-2 h-2 rounded-full bg-foreground/30" /> {successCount} Info
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Shield className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">No alerts yet. Activity will generate alerts automatically.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const style = alertStyles[alert.type];
            return (
              <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className={`glass-card border-border/50 border-l-4 ${style.border} cursor-pointer`}>
                  <CardContent className="py-4 flex items-start gap-4">
                    <div className={`mt-0.5 ${style.icon}`}>
                      <alert.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium">{alert.title}</h3>
                        <Badge variant="outline" className={`text-[10px] ${style.badge}`}>
                          {alert.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{alert.time}</span>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
