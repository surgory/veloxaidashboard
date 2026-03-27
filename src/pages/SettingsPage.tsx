import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Shield, Bell, Palette } from "lucide-react";

export default function SettingsPage() {
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
              <Input type="number" defaultValue="365" />
            </div>
            <div className="space-y-2">
              <Label>Trial Duration (days)</Label>
              <Input type="number" defaultValue="30" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Max Activations per Key</Label>
            <Select defaultValue="1">
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
          <div className="space-y-2">
            <Label>Admin Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Require HWID for Trial</Label>
              <p className="text-xs text-muted-foreground">Bind trial keys to hardware</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Revoke on Chargeback</Label>
              <p className="text-xs text-muted-foreground">Automatically revoke keys on payment disputes</p>
            </div>
            <Switch defaultChecked />
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
            <Input placeholder="https://discord.com/api/webhooks/..." />
          </div>
          <div className="space-y-2">
            <Label>Telegram Bot Token</Label>
            <Input placeholder="bot_token:chat_id" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Alerts for New Activations</Label>
              <p className="text-xs text-muted-foreground">Get notified on each activation</p>
            </div>
            <Switch />
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
            <Input defaultValue="VeloxAI" />
          </div>
          <div className="space-y-2">
            <Label>Logo Upload</Label>
            <Input type="file" accept="image/*" />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full btn-click">Save Settings</Button>
    </div>
  );
}
