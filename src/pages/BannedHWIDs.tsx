import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Ban, Unlock, Loader2, RefreshCw, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { sendDiscordNotification } from "@/lib/discord";
import type { BannedHWID } from "@/lib/types";

export default function BannedHWIDs() {
  const { toast } = useToast();
  const [banned, setBanned] = useState<BannedHWID[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newHwid, setNewHwid] = useState("");
  const [newReason, setNewReason] = useState("");
  const [banning, setBanning] = useState(false);

  useEffect(() => {
    fetchBanned();
  }, []);

  async function fetchBanned() {
    setLoading(true);
    const { data, error } = await supabase.from("banned_hwids").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading banned HWIDs", description: error.message, variant: "destructive" });
    }
    setBanned(data || []);
    setLoading(false);
  }

  async function unbanHwid(id: number) {
    setActionLoading(id);
    const { error } = await supabase.from("banned_hwids").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to unban", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "HWID unbanned" });
      setBanned(prev => prev.filter(b => b.id !== id));
    }
    setActionLoading(null);
  }

  async function banHwid() {
    if (!newHwid.trim()) {
      toast({ title: "HWID is required", variant: "destructive" });
      return;
    }
    setBanning(true);
    const { error } = await supabase.from("banned_hwids").insert({
      hwid: newHwid.trim(),
      reason: newReason.trim() || null,
      banned_by: "Admin",
    });
    if (error) {
      toast({ title: "Failed to ban HWID", description: error.code === "23505" ? "This HWID is already banned" : error.message, variant: "destructive" });
    } else {
      toast({ title: "HWID banned", description: newHwid });
      setNewHwid("");
      setNewReason("");
      setDialogOpen(false);
      fetchBanned();
    }
    setBanning(false);
  }

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : "Permanent";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Banned HWIDs</h1>
          <p className="text-sm text-muted-foreground mt-1">{banned.length} banned computers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchBanned} disabled={loading} className="gap-2 btn-click">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 btn-click"><Ban className="h-4 w-4" /> Ban HWID</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Ban a Hardware ID</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>HWID</Label>
                  <Input placeholder="Enter hardware ID..." value={newHwid} onChange={(e) => setNewHwid(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea placeholder="Why is this HWID being banned?" value={newReason} onChange={(e) => setNewReason(e.target.value)} />
                </div>
                <Button onClick={banHwid} disabled={banning} className="w-full gap-2 btn-click">
                  {banning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                  {banning ? "Banning..." : "Ban HWID"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="glass-card border-border/50">
        <CardContent className="pt-6 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
            </div>
          ) : banned.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Ban className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No banned HWIDs. That's a good sign!</p>
            </div>
          ) : (
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
                {banned.map((b) => (
                  <TableRow key={b.id} className="interactive-row border-border/30">
                    <TableCell className="font-mono text-xs text-foreground/70">{b.hwid}</TableCell>
                    <TableCell className="text-sm">{b.reason || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{b.banned_by || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-accent/50 text-foreground/70 border-border">
                        {formatDate(b.expires_at)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="gap-1 text-xs btn-click" disabled={actionLoading === b.id} onClick={() => unbanHwid(b.id)}>
                        {actionLoading === b.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unlock className="h-3 w-3" />} Unban
                      </Button>
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
