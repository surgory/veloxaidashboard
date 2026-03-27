import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Search, Ban, Clock, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const mockLicenses = [
  { key: "AI-7K3M9P2X", type: "Premium", status: "Active", owner: "John Doe", hwid: "ABC123DEF456", created: "2024-01-15", expires: "2025-01-15", uses: 1, lastUsed: "2024-03-10" },
  { key: "AI-4H8N1L5R", type: "Lifetime", status: "Active", owner: "Jane Smith", hwid: "GHI789JKL012", created: "2024-02-01", expires: "Never", uses: 3, lastUsed: "2024-03-12" },
  { key: "AI-6W9T2Q7B", type: "Trial", status: "Expired", owner: "Bob Wilson", hwid: "MNO345PQR678", created: "2024-01-20", expires: "2024-02-19", uses: 1, lastUsed: "2024-02-15" },
  { key: "AI-3F5V8C1D", type: "Premium", status: "Revoked", owner: "Alice Brown", hwid: "STU901VWX234", created: "2024-01-10", expires: "2025-01-10", uses: 5, lastUsed: "2024-03-01" },
  { key: "AI-9J2K6M4P", type: "Trial", status: "Active", owner: "Charlie Davis", hwid: "—", created: "2024-03-11", expires: "2024-04-10", uses: 0, lastUsed: "—" },
];

export default function AllLicenses() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const filtered = mockLicenses.filter((l) => {
    const matchSearch = !search || l.key.toLowerCase().includes(search.toLowerCase()) || l.owner.toLowerCase().includes(search.toLowerCase()) || l.hwid.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || l.type === typeFilter;
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const handleStatusFilter = (status: string) => {
    setStatusFilter(prev => prev === status ? "all" : status);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">All Licenses</h1>
        <p className="text-sm text-muted-foreground mt-1">View, search, filter, and manage all license keys</p>
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
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Trial">Trial</SelectItem>
                <SelectItem value="Lifetime">Lifetime</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
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
                    <Badge variant="outline" className="bg-accent/50 text-foreground/80 border-border">{l.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="status-badge bg-accent/50 text-foreground/70 border-border cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); handleStatusFilter(l.status); }}
                    >
                      {l.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{l.owner}</TableCell>
                  <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">{l.hwid}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{l.expires}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{l.uses}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent btn-click"><Ban className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent>Revoke</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent btn-click"><Clock className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent>Extend</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent btn-click"><Pencil className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent>Edit</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent btn-click"><Trash2 className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
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
