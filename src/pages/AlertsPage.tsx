import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Key } from "lucide-react";
import { motion } from "framer-motion";

const mockAlerts = [
  { id: 1, type: "critical", icon: Shield, title: "Crack Attempt Detected", description: "User ran loader in debugger from HWID: FAKE_HWID_01", time: "2 min ago" },
  { id: 2, type: "critical", icon: AlertTriangle, title: "HWID Mismatch", description: "Key AI-7K3M9P2X used on different PC (HWID: NEW_PC_999)", time: "15 min ago" },
  { id: 3, type: "warning", icon: AlertTriangle, title: "Multiple Failures", description: "5+ failed activation attempts from IP 203.0.113.5", time: "1 hour ago" },
  { id: 4, type: "warning", icon: Shield, title: "Revoked Key Used", description: "Someone tried to use revoked key AI-3F5V8C1D", time: "2 hours ago" },
  { id: 5, type: "success", icon: CheckCircle, title: "New Activation", description: "Key AI-9J2K6M4P successfully activated by Charlie Davis", time: "3 hours ago" },
  { id: 6, type: "success", icon: Key, title: "Key Generated", description: "New Premium key AI-2B8X4R6L created for Mike Johnson", time: "5 hours ago" },
];

const alertStyles: Record<string, { badge: string; border: string; icon: string }> = {
  critical: { badge: "bg-foreground/10 text-foreground border-foreground/20", border: "border-l-foreground", icon: "text-foreground" },
  warning: { badge: "bg-foreground/5 text-foreground/70 border-foreground/10", border: "border-l-foreground/50", icon: "text-foreground/60" },
  success: { badge: "bg-foreground/5 text-foreground/50 border-foreground/10", border: "border-l-foreground/30", icon: "text-foreground/40" },
};

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Security Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time monitoring of suspicious activity</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Badge variant="outline" className="bg-foreground/10 text-foreground border-foreground/20 gap-1">
          <span className="w-2 h-2 rounded-full bg-foreground animate-pulse-glow" /> 2 Critical
        </Badge>
        <Badge variant="outline" className="bg-foreground/5 text-foreground/70 border-foreground/10 gap-1">
          <span className="w-2 h-2 rounded-full bg-foreground/50" /> 2 Warnings
        </Badge>
        <Badge variant="outline" className="bg-foreground/5 text-foreground/50 border-foreground/10 gap-1">
          <span className="w-2 h-2 rounded-full bg-foreground/30" /> 2 Info
        </Badge>
      </div>

      <div className="space-y-3">
        {mockAlerts.map((alert, i) => {
          const style = alertStyles[alert.type];
          return (
            <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
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
    </div>
  );
}
