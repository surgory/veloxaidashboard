export interface License {
  id: number;
  key: string;
  type: string;
  status: string;
  hwid: string | null;
  owner_name: string | null;
  owner_email: string | null;
  expires_at: string | null;
  created_at: string | null;
  last_used: string | null;
  uses: number;
  generated_by_discord_id: string | null;
  generated_by_discord_name: string | null;
  revoked_by_discord_id: string | null;
  revoked_by_discord_name: string | null;
}

export interface ActivationLog {
  id: number;
  license_key: string;
  hwid: string | null;
  ip: string | null;
  action: string;
  created_at: string;
  pc_name?: string | null;
}

export interface BannedHWID {
  id: number;
  hwid: string;
  reason: string | null;
  banned_by: string | null;
  banned_by_discord_id: string | null;
  banned_by_discord_name: string | null;
  created_at: string;
  expires_at: string | null;
}

export interface AuditLog {
  id: number;
  admin_discord_id: string;
  admin_discord_name: string;
  action: string;
  target: string;
  details: string | null;
  created_at: string;
}
