'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePlanifikaAdmins } from "../../hooks/usePlanifikaAdmins";
import planifikaLogo from "../../public/assets/images/planifika_logo.png";
import { organizationService } from "../services/organizationService";

export default function PlanifikaAdminsPage() {
  const { admins, loading, error, refetch } = usePlanifikaAdmins();
  const [orgNames, setOrgNames] = useState<Record<number, string>>({});
  const [orgLoading, setOrgLoading] = useState<boolean>(false);
  const [orgError, setOrgError] = useState<string | null>(null);

  const getPhotoUrl = (u: any): string | undefined => {
    return (
      u?.photoURL ||
      u?.photoUrl ||
      u?.avatarUrl ||
      u?.avatar ||
      u?.imageUrl ||
      u?.image ||
      u?.picture ||
      u?.profilePhotoUrl ||
      u?.profilePictureUrl ||
      undefined
    );
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return '–';
    const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '–';
  };

  // Extraer id de organización desde distintas posibles propiedades
  const getOrgId = (u: any): number | null => {
    const id =
      u?.idOrganization ??
      u?.organizationId ??
      u?.idOrg ??
      u?.orgId ??
      u?.organization?.id ??
      null;
    return typeof id === "number" ? id : null;
  };

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        setOrgLoading(true);
        setOrgError(null);
        const ids = Array.from(
          new Set(
            admins
              .map((u: any) => getOrgId(u))
              .filter((v: number | null): v is number => v !== null)
          )
        );

        const idsToFetch = ids.filter((id) => !(id in orgNames));
        if (idsToFetch.length === 0) {
          return;
        }

        const results = await Promise.allSettled(
          idsToFetch.map(async (id) => {
            const org = await organizationService.getOrganizationById(id);
            return { id, name: org?.name ?? String(id) };
          })
        );

        const nextMap: Record<number, string> = {};
        results.forEach((res) => {
          if (res.status === "fulfilled") {
            nextMap[res.value.id] = res.value.name;
          }
        });

        if (Object.keys(nextMap).length > 0) {
          setOrgNames((prev) => ({ ...prev, ...nextMap }));
        }
      } catch (e: any) {
        setOrgError(e?.message || "Error al cargar organizaciones");
      } finally {
        setOrgLoading(false);
      }
    };

    if (admins && admins.length > 0) {
      fetchOrgs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admins]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Image src={planifikaLogo} alt="Planifika" width={40} height={40} />
        <h1 className="text-2xl font-semibold">Administradores de organizaciones (Planifika)</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={refetch}
          className="px-4 py-2 rounded bg-black text-white hover:opacity-90"
        >
          Recargar
        </button>

      </div>

      {loading && <p>Cargando administradores…</p>}
      {error && (
        <p className="text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 border-b">Foto</th>
                <th className="text-left p-3 border-b">ID</th>
                <th className="text-left p-3 border-b">Nombre</th>
                <th className="text-left p-3 border-b">Organización</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((u, idx) => (
                <tr key={`${u.id ?? u.idUser ?? idx}`} className="even:bg-gray-50">
                  <td className="p-3 border-b">
                    {(() => {
                      const url = getPhotoUrl(u as any);
                      const displayName = (u as any).name ?? (u as any).fullName ?? 'Usuario';
                      if (url) {
                        return (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={url}
                            alt={`Foto de ${displayName}`}
                            className="w-10 h-10 rounded-full object-cover bg-gray-100"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        );
                      }
                      return (
                        <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
                          {getInitials(displayName)}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="p-3 border-b">{u.id ?? u.idUser ?? "-"}</td>
                  <td className="p-3 border-b">{u.name ?? u.fullName ?? "-"}</td>
                  <td className="p-3 border-b">
                    {(() => {
                      const orgId = getOrgId(u as any);
                      if (orgId == null) return "-";
                      return orgNames[orgId] ?? (orgLoading ? "Cargando..." : String(orgId));
                    })()}
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={4}>
                    No se encontraron administradores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


