import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const mockLogs = [
  { timestamp: "2024-03-12 14:23:05", key: "AI-7K3M9P2X", hwid: "ABC123DEF456", ip: "192.168.1.42", pcName: "DESKTOP-JD01", action: "Validate", status: "Success" },
  { timestamp: "2024-03-12 14:15:32", key: "AI-3F5V8C1D", hwid: "STU901VWX234", ip: "10.0.0.15", pcName: "LAPTOP-AB02", action: "Activate", status: "Failed" },
  { timestamp: "2024-03-12 13:45:10", key: "AI-4H8N1L5R", hwid: "GHI789JKL012", ip: "172.16.0.8", pcName: "PC-JANE", action: "Validate", status: "Success" },
  { timestamp: "2024-03-12 12:30:00", key: "AI-6W9T2Q7B", hwid: "XXX999YYY888", ip: "203.0.113.5", pcName: "UNKNOWN-PC", action: "Activate", status: "Failed" },
  { timestamp: "2024-03-12 11:10:45", key: "AI-9J2K6M4P", hwid: "MNO345PQR678", ip: "198.51.100.3", pcName: "DESKTOP-CD03", action: "Activate", status: "Success" },
  { timestamp: "2024-03-12 10:05:22", key: "AI-3F5V8C1D", hwid: "FAKE_HWID_01", ip: "192.0.2.10", pcName: "DEBUG-VM", action: "Activate", status: "Failed" },
];

export default function ActivationLogs() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Activation Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Track every activation and validation attempt</p>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-foreground/70" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>Timestamp</TableHead>
                <TableHead>License Key</TableHead>
                <TableHead className="hidden md:table-cell">HWID</TableHead>
                <TableHead className="hidden lg:table-cell">IP Address</TableHead>
                <TableHead className="hidden lg:table-cell">PC Name</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLogs.map((log, i) => (
                <TableRow key={i} className={`interactive-row border-border/30 ${log.status === "Failed" ? "bg-foreground/[0.02]" : ""}`}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="license-key-block flex items-center gap-1"
                          onClick={() => { navigator.clipboard.writeText(log.key); toast({ title: "Copied!", description: log.key }); }}
                        >
                          {log.key} <Copy className="h-3 w-3 opacity-50" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Click to copy</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">{log.hwid}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{log.ip}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs">{log.pcName}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs bg-accent/50 border-border">{log.action}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${log.status === "Success" ? "bg-foreground/10 text-foreground/80 border-foreground/20" : "bg-foreground/5 text-muted-foreground border-border"}`}>
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
