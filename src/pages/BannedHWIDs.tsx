import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ban, Unlock } from "lucide-react";

const mockBanned = [
  { hwid: "FAKE_HWID_01", reason: "Debugger detected - crack attempt", bannedBy: "Admin", dateBanned: "2024-03-10", expires: "Permanent" },
  { hwid: "XXX999YYY888", reason: "Chargeback fraud", bannedBy: "System", dateBanned: "2024-03-08", expires: "Permanent" },
  { hwid: "CRACK_VM_002", reason: "Multiple failed activations", bannedBy: "Auto", dateBanned: "2024-03-05", expires: "2024-04-05" },
];

export default function BannedHWIDs() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Banned HWIDs</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage banned computers</p>
        </div>
        <Button className="gap-2 btn-click"><Ban className="h-4 w-4" /> Ban HWID</Button>
      </div>

      <Card className="glass-card border-border/50">
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>HWID</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="hidden md:table-cell">Banned By</TableHead>
                <TableHead className="hidden md:table-cell">Date Banned</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBanned.map((b) => (
                <TableRow key={b.hwid} className="interactive-row border-border/30">
                  <TableCell className="font-mono text-xs text-foreground/70">{b.hwid}</TableCell>
                  <TableCell className="text-sm">{b.reason}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{b.bannedBy}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{b.dateBanned}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-accent/50 text-foreground/70 border-border">
                      {b.expires}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="gap-1 text-xs btn-click"><Unlock className="h-3 w-3" /> Unban</Button>
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
