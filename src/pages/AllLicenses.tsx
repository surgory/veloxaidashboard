import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Search, Ban, Clock, Pencil, Trash2, X, RefreshCw, Loader2, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import { sendDiscordNotification } from "@/lib/discord";
import type { License } from "@/lib/types";

export default function AllLicenses() {
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchLicenses();
  }, []);

  async function fetchLicenses() {
    setLoading(true);
    const { data, error } = await supabase.from("licenses").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading licenses", description: error.message, variant: "destructive" });
    }
    setLicenses(data || []);
    setLoading(false);
  }

  async function revokeLicense(key: string) {
    setActionLoading(key);
    const { error } = await supabase.from("licenses").update({ status: "revoked" }).eq("key", key);
    if (error) {
      toast({ title: "Failed to revoke", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "License revoked", description: key });
      setLicenses(prev => prev.map(l => l.key === key ? { ...l, status: "revoked" } : l));
    }
    setActionLoading(null);
  }

  async function deleteLicense(key: string) {
    setActionLoading(key);
    const { error } = await supabase.from("licenses").delete().eq("key", key);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "License deleted", description: key });
      setLicenses(prev => prev.filter(l => l.key !== key));
    }
    setActionLoading(null);
  }

  const filtered = licenses.filter((l) => {
    const matchSearch = !search || l.key.toLowerCase().includes(search.toLowerCase()) || (l.owner_name || "").toLowerCase().includes(search.toLowerCase()) || (l.hwid || "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || l.type === typeFilter;
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const handleStatusFilter = (status: string) => {
    setStatusFilter(prev => prev === status ? "all" : status);
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">All Licenses</h1>
          <p className="text-sm text-muted-foreground mt-1">{licenses.length} total licenses</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLicenses} disabled={loading} className="gap-2 btn-click">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by key, owner, or HWID..." className="pl-9 pr-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="lifetime">Lifetime</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading licenses...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Key className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">{licenses.length === 0 ? "No licenses yet. Generate some keys first!" : "No licenses match your filters."}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Owner</TableHead>
                  <TableHead className="hidden lg:table-cell">HWID</TableHead>
                  <TableHead className="hidden lg:table-cell">Expires</TableHead>
                  <TableHead className="hidden md:table-cell">Uses</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow
                    key={l.key}
                    className={`interactive-row border-border/30 ${selectedKey === l.key ? "bg-accent border border-foreground/20" : ""}`}
                    onClick={() => setSelectedKey(l.key === selectedKey ? null : l.key)}
                  >
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(l.key); toast({ title: "Copied!" }); }} className="license-key-block flex items-center gap-1">
                            {l.key} <Copy className="h-3 w-3 opacity-50" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Click to copy</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-accent/50 text-foreground/80 border-border capitalize">{l.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`status-badge capitalize cursor-pointer ${
                          l.status === "active" ? "bg-foreground/10 text-foreground/80 border-foreground/20" :
                          l.status === "revoked" ? "bg-foreground/5 text-muted-foreground border-border" :
                          "bg-foreground/5 text-muted-foreground border-border"
                        }`}
                        onClick={(e) => { e.stopPropagation(); handleStatusFilter(l.status); }}
                      >
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{l.owner_name || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">{l.hwid || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{l.type === "lifetime" ? "Never" : formatDate(l.expires_at)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{l.uses}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {l.status === "active" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent btn-click" disabled={actionLoading === l.key} onClick={(e) => { e.stopPropagation(); revokeLicense(l.key); }}>
                                {actionLoading === l.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Revoke</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent btn-click" disabled={actionLoading === l.key} onClick={(e) => { e.stopPropagation(); deleteLicense(l.key); }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
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
