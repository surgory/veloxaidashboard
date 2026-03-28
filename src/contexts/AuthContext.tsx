import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export const OWNER_EMAIL = "admin@veloxai.site";
export const OWNER_DISCORD_ID = "1044757372498894849";

interface DiscordProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isOwner: boolean;
  discord: DiscordProfile | null;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function extractDiscordProfile(user: User | null): DiscordProfile | null {
  if (!user) return null;
  const meta = user.user_metadata;
  if (!meta) return null;
  return {
    id: meta.provider_id || meta.sub || user.id,
    username: meta.full_name || meta.name || meta.preferred_username || "Unknown",
    avatar_url: meta.avatar_url || null,
    email: user.email || meta.email || null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const discord = extractDiscordProfile(user);
  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const signInWithDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        scopes: "identify email guilds",
        redirectTo: window.location.origin,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isOwner, discord, signInWithDiscord, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
