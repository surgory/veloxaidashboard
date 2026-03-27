import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Pencil, Trash2 } from "lucide-react";

const mockAdmins = [
  { username: "admin", email: "admin@veloxai.site", role: "Owner", lastLogin: "2024-03-12 14:30" },
  { username: "moderator1", email: "mod1@veloxai.site", role: "Admin", lastLogin: "2024-03-11 09:15" },
  { username: "support", email: "support@veloxai.site", role: "Viewer", lastLogin: "2024-03-10 16:45" },
];

export default function Admins() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Admins & Staff</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage who can access the dashboard</p>
        </div>
        <Button className="gap-2 btn-click"><UserPlus className="h-4 w-4" /> Add Admin</Button>
      </div>

      <Card className="glass-card border-border/50">
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAdmins.map((a) => (
                <TableRow key={a.username} className="interactive-row border-border/30">
                  <TableCell className="font-medium">{a.username}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.email}</TableCell>
                  <TableCell><Badge variant="outline" className="bg-accent/50 text-foreground/70 border-border">{a.role}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{a.lastLogin}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent btn-click"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent btn-click"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
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
