import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Key, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

function generateKey(): string {
  const chars = "BCDFGHJKLMNPQRSTVWXYZ23456789";
  let key = "AI-";
  for (let i = 0; i < 8; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

function getExpiresAt(type: string): string | null {
  if (type === "lifetime") return null;
  const d = new Date();
  d.setDate(d.getDate() + (type === "premium" ? 365 : 30));
  return d.toISOString();
}

export default function GenerateKeys() {
  const { toast } = useToast();
  const [licenseType, setLicenseType] = useState("premium");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const qty = Math.min(Math.max(parseInt(quantity) || 1, 1), 100);
      const keys: string[] = [];

      for (let i = 0; i < qty; i++) {
        const key = generateKey();
        const { error } = await supabase.from("licenses").insert({
          key,
          type: licenseType,
          status: "active",
          owner_name: customerName || null,
          owner_email: customerEmail || null,
          expires_at: getExpiresAt(licenseType),
          uses: 0,
        });

        if (error) {
          // Key collision — retry once
          if (error.code === "23505") {
            const retryKey = generateKey();
            const { error: retryError } = await supabase.from("licenses").insert({
              key: retryKey,
              type: licenseType,
              status: "active",
              owner_name: customerName || null,
              owner_email: customerEmail || null,
              expires_at: getExpiresAt(licenseType),
              uses: 0,
            });
            if (retryError) throw retryError;
            keys.push(retryKey);
          } else {
            throw error;
          }
        } else {
          keys.push(key);
        }
      }

      setGeneratedKeys(keys);
      if (keys.length === 1) {
        navigator.clipboard.writeText(keys[0]);
      }
      toast({ title: `${keys.length} key(s) generated & saved`, description: keys.length === 1 ? "Auto-copied to clipboard" : `Type: ${licenseType}` });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error generating keys", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied!", description: key });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Generate Keys</h1>
        <p className="text-sm text-muted-foreground mt-1">Create new license keys and save them to the database</p>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Key className="h-4 w-4 text-foreground/70" />
            New License Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>License Type</Label>
            <Select value={licenseType} onValueChange={setLicenseType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="premium">Premium (365 days)</SelectItem>
                <SelectItem value="trial">Trial (30 days)</SelectItem>
                <SelectItem value="lifetime">Lifetime</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input placeholder="John Doe" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Customer Email</Label>
              <Input type="email" placeholder="john@example.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" min="1" max="100" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2 btn-click">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
              {isGenerating ? "Generating..." : "Generate Key"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedKeys.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border-foreground/20">
            <CardHeader>
              <CardTitle className="text-base font-display">Generated Keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {generatedKeys.map((key) => (
                <div key={key} className="flex items-center justify-between bg-muted rounded-lg px-4 py-3 transition-all duration-200 hover:bg-foreground/10">
                  <code className="license-key-block" onClick={() => copyKey(key)}>{key}</code>
                  <Button variant="ghost" size="icon" onClick={() => copyKey(key)} className="btn-click">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
