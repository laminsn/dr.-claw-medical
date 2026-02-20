import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserIntegration {
  id: string;
  integration_key: string;
  is_active: boolean | null;
}

export function useUserIntegrations() {
  const { user } = useAuth();
  const [connectedIntegrations, setConnectedIntegrations] = useState<UserIntegration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setConnectedIntegrations([]);
      setLoading(false);
      return;
    }

    const fetchIntegrations = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("user_integrations")
        .select("id, integration_key, is_active")
        .eq("user_id", user.id);

      setConnectedIntegrations(data ?? []);
      setLoading(false);
    };

    fetchIntegrations();
  }, [user]);

  const isConnected = (integrationKey: string): boolean => {
    return connectedIntegrations.some(
      (i) => i.integration_key === integrationKey && i.is_active !== false
    );
  };

  const connectedLlmKeys = connectedIntegrations
    .filter((i) => i.is_active !== false)
    .map((i) => i.integration_key);

  const refetch = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_integrations")
      .select("id, integration_key, is_active")
      .eq("user_id", user.id);
    setConnectedIntegrations(data ?? []);
  };

  return { connectedIntegrations, loading, isConnected, connectedLlmKeys, refetch };
}
