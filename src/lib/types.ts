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
}

export interface ActivationLog {
  id: number;
  license_key: string;
  hwid: string | null;
  ip: string | null;
  action: string;
  created_at: string;
}

export interface BannedHWID {
  id: number;
  hwid: string;
  reason: string | null;
  banned_by: string | null;
  created_at: string;
  expires_at: string | null;
}
