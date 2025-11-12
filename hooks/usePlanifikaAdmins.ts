import { useEffect, useMemo, useState } from "react";
import { planifikaUserService } from "../app/services/planifikaUserService";
import { PlanifikaUser } from "../app/types/planifika";

interface UsePlanifikaAdminsResult {
  admins: PlanifikaUser[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePlanifikaAdmins(): UsePlanifikaAdminsResult {
  const [data, setData] = useState<PlanifikaUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const admins = await planifikaUserService.getAdminUsers();
      setData(admins);
    } catch (e: any) {
      setError(e?.message || "Error al cargar administradores de Planifika");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const admins = useMemo(() => data, [data]);

  return { admins, loading, error, refetch: fetchAdmins };
}


