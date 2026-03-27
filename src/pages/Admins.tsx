import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
  lastLogin: string;
}

const defaultAdmins: Admin[] = [
  { id: "1", username: "admin", email: "admin@veloxai.site", role: "Owner", lastLogin: new Date().toLocaleString() },
];

function loadAdmins(): Admin[] {
  try {
    const stored = localStorage.getItem("velox_admins");
    return stored ? JSON.parse(stored) : defaultAdmins;
  } catch {
    return defaultAdmins;
  }
}

function saveAdmins(admins: Admin[]) {
  localStorage.setItem("velox_admins", JSON.stringify(admins));
}

export default function Admins() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<Admin[]>(loadAdmins);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Admin");

  const updateAdmins = (newAdmins: Admin[]) => {
    setAdmins(newAdmins);
    saveAdmins(newAdmins);
  };

  const openAdd = () => {
    setEditingAdmin(null);
    setUsername("");
    setEmail("");
    setRole("Admin");
    setDialogOpen(true);
  };

  const openEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setUsername(admin.username);
    setEmail(admin.email);
    setRole(admin.role);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!username.trim() || !email.trim()) {
      toast({ title: "Username and email are required", variant: "destructive" });
      return;
    }

    if (editingAdmin) {
      const updated = admins.map(a =>
        a.id === editingAdmin.id ? { ...a, username: username.trim(), email: email.trim(), role } : a
      );
      updateAdmins(updated);
      toast({ title: "Admin updated", description: username });
    } else {
      const newAdmin: Admin = {
        id: crypto.randomUUID(),
        username: username.trim(),
        email: email.trim(),
        role,
        lastLogin: "Never",
      };
      updateAdmins([...admins, newAdmin]);
      toast({ title: "Admin added", description: username });
    }
    setDialogOpen(false);
  };

  const handleDelete = (admin: Admin) => {
    if (admin.role === "Owner") {
      toast({ title: "Cannot delete the owner", variant: "destructive" });
      return;
    }
    updateAdmins(admins.filter(a => a.id !== admin.id));
    toast({ title: "Admin removed", description: admin.username });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Admins & Staff</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage who can access the dashboard</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 btn-click" onClick={openAdd}><UserPlus className="h-4 w-4" /> Add Admin</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editingAdmin ? "Edit Admin" : "Add Admin"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input placeholder="Enter username..." value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full btn-click">
                {editingAdmin ? "Save Changes" : "Add Admin"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card border-border/50">
        <CardContent className="pt-6 overflow-x-auto">
          {admins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <UserPlus className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No admins configured.</p>
            </div>
          ) : (
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
                {admins.map((a) => (
                  <TableRow key={a.id} className="interactive-row border-border/30">
                    <TableCell className="font-medium">{a.username}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.email}</TableCell>
                    <TableCell><Badge variant="outline" className="bg-accent/50 text-foreground/70 border-border">{a.role}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{a.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent btn-click" onClick={() => openEdit(a)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent btn-click" onClick={() => handleDelete(a)} disabled={a.role === "Owner"}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
