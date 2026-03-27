import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Copy, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import type { ActivationLog } from "@/lib/types";

export default function ActivationLogs() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    const { data, error } = await supabase.from("activation_logs").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) {
      toast({ title: "Error loading logs", description: error.message, variant: "destructive" });
    }
    setLogs(data || []);
    setLoading(false);
  }

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Activation Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Track every activation and validation attempt</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading} className="gap-2 btn-click">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-foreground/70" />
            Recent Activity ({logs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ScrollText className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No activation logs yet. Activity will show up here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>License Key</TableHead>
                  <TableHead className="hidden md:table-cell">HWID</TableHead>
                  <TableHead className="hidden lg:table-cell">IP Address</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="interactive-row border-border/30">
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatTimestamp(log.created_at)}</TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="license-key-block flex items-center gap-1"
                            onClick={() => { navigator.clipboard.writeText(log.license_key); toast({ title: "Copied!", description: log.license_key }); }}
                          >
                            {log.license_key} <Copy className="h-3 w-3 opacity-50" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Click to copy</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">{log.hwid || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{log.ip || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs bg-accent/50 border-border capitalize">{log.action}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
