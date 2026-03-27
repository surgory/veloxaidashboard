import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Shield, Bell, Palette, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppSettings {
  premiumDuration: number;
  trialDuration: number;
  maxActivations: string;
  requireHwidTrial: boolean;
  autoRevokeChargeback: boolean;
  discordWebhook: string;
  telegramBot: string;
  emailAlerts: boolean;
  dashboardName: string;
}

const defaultSettings: AppSettings = {
  premiumDuration: 365,
  trialDuration: 30,
  maxActivations: "1",
  requireHwidTrial: true,
  autoRevokeChargeback: true,
  discordWebhook: "",
  telegramBot: "",
  emailAlerts: false,
  dashboardName: "VeloxAI",
};

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem("velox_settings");
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    localStorage.setItem("velox_settings", JSON.stringify(settings));
    setSaving(false);
    setHasChanges(false);
    toast({ title: "Settings saved", description: "Your configuration has been updated" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure system-wide settings</p>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-foreground/70" /> License Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Premium Duration (days)</Label>
              <Input type="number" value={settings.premiumDuration} onChange={(e) => update("premiumDuration", parseInt(e.target.value) || 365)} />
            </div>
            <div className="space-y-2">
              <Label>Trial Duration (days)</Label>
              <Input type="number" value={settings.trialDuration} onChange={(e) => update("trialDuration", parseInt(e.target.value) || 30)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Max Activations per Key</Label>
            <Select value={settings.maxActivations} onValueChange={(v) => update("maxActivations", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 (HWID Bound)</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Shield className="h-4 w-4 text-foreground/70" /> Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Require HWID for Trial</Label>
              <p className="text-xs text-muted-foreground">Bind trial keys to hardware</p>
            </div>
            <Switch checked={settings.requireHwidTrial} onCheckedChange={(v) => update("requireHwidTrial", v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Revoke on Chargeback</Label>
              <p className="text-xs text-muted-foreground">Automatically revoke keys on payment disputes</p>
            </div>
            <Switch checked={settings.autoRevokeChargeback} onCheckedChange={(v) => update("autoRevokeChargeback", v)} />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Bell className="h-4 w-4 text-foreground/70" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Discord Webhook URL</Label>
            <Input placeholder="https://discord.com/api/webhooks/..." value={settings.discordWebhook} onChange={(e) => update("discordWebhook", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Telegram Bot Token</Label>
            <Input placeholder="bot_token:chat_id" value={settings.telegramBot} onChange={(e) => update("telegramBot", e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Alerts for New Activations</Label>
              <p className="text-xs text-muted-foreground">Get notified on each activation</p>
            </div>
            <Switch checked={settings.emailAlerts} onCheckedChange={(v) => update("emailAlerts", v)} />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Palette className="h-4 w-4 text-foreground/70" /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Dashboard Name</Label>
            <Input value={settings.dashboardName} onChange={(e) => update("dashboardName", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving || !hasChanges} className="w-full gap-2 btn-click">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : hasChanges ? null : <Check className="h-4 w-4" />}
        {saving ? "Saving..." : hasChanges ? "Save Settings" : "Settings Saved"}
      </Button>
    </div>
  );
}
