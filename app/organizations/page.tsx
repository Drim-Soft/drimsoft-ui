'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Building2, MapPin, Phone, Mail, Users, Calendar, AlertTriangle } from 'lucide-react';
import { organizationService, Organization, CreateOrganizationRequest, UpdateOrganizationRequest } from '../services/organizationService';
import { PLANIFIKA_USER_TYPES } from '../types/planifika';
import { userService } from '../services/userService';

// Helper function to get user count for display
const getUserCount = (organization: Organization): number => {
  return organization.users ? organization.users.length : 0;
};

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  // Paginación
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12); // cards por página
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [deletingOrganization, setDeletingOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nit: '',
    name: '',
    address: '',
    phone: '',
    photoURL: '',
    domain: ''
  });
  // Conteo real de usuarios por organización para las cards
  const [usersCountByOrg, setUsersCountByOrg] = useState<Record<number, number>>({});
  // Detalles
  const [showDetails, setShowDetails] = useState(false);
  const [detailsOrg, setDetailsOrg] = useState<Organization | null>(null);
  const [detailsUsers, setDetailsUsers] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const getPlanifikaRoleLabel = (user: any): string | undefined => {
    const typeId = Number(user?.idUserType ?? user?.userType);
    if (!Number.isFinite(typeId)) return undefined;
    if (typeId === PLANIFIKA_USER_TYPES.ORG_ADMIN) return 'Administrador';
    return 'Usuario';
  };

  const normalize = (value: unknown): string => {
    if (typeof value !== 'string') return '';
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, '')
      .trim();
  };

  // Load organizations on component mount and when pagination or applied search changes
  useEffect(() => {
    loadOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, appliedSearch]);

  // Backend filtered (mostrar tal cual llega)
  useEffect(() => {
    setFilteredOrganizations(organizations);
  }, [organizations]);

  // Al cambiar las organizaciones visibles, obtener el conteo real de usuarios
  useEffect(() => {
    const fetchCounts = async () => {
      const orgsWithId = filteredOrganizations.filter((o) => typeof o.id === 'number') as Array<Required<Pick<Organization, 'id'>>> & Organization[];
      const missing = orgsWithId.filter((o) => usersCountByOrg[o.id!] === undefined);
      if (missing.length === 0) return;
      try {
        const entries = await Promise.all(
          missing.map(async (o) => {
            try {
              const users = await organizationService.getUsersByOrganization(o.id!);
              return [o.id!, Array.isArray(users) ? users.length : 0] as const;
            } catch {
              return [o.id!, 0] as const;
            }
          })
        );
        setUsersCountByOrg((prev) => {
          const next = { ...prev };
          for (const [id, count] of entries) next[id] = count;
          return next;
        });
      } catch {
        // sincrónicamente ignorar, las cards podrán seguir mostrando '-'
      }
    };
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredOrganizations]);

  const loadOrganizations = async () => {
    try {
      setInitialLoading(true);
      setError(null);
      // Usar el nuevo endpoint paginado con búsqueda opcional
      const data = await organizationService.getOrganizationsPaginated(page, size, appliedSearch || undefined);
      setOrganizations(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error('Error loading organizations:', error);
      setError('Error al cargar las organizaciones. Verifica que el backend esté ejecutándose.');
    } finally {
      setInitialLoading(false);
    }
  };

  const triggerSearch = () => {
    const value = (searchTerm || '').trim();
    setPage(0); // reiniciar a primera página en nueva búsqueda
    setAppliedSearch(value);
  };

  const handleCreate = () => {
    setEditingOrganization(null);
    setFormData({
      nit: '',
      name: '',
      address: '',
      phone: '',
      photoURL: '',
      domain: ''
    });
    setShowModal(true);
  };

  const handleEdit = (organization: Organization) => {
    setEditingOrganization(organization);
    setFormData({
      nit: organization.nit,
      name: organization.name,
      address: organization.address || '',
      phone: organization.phone || '',
      photoURL: organization.photoURL || '',
      domain: organization.domain || ''
    });
    setShowModal(true);
  };

  const handleDelete = (organization: Organization) => {
    setDeletingOrganization(organization);
    setShowDeleteModal(true);
  };

  const handleViewDetails = async (organization: Organization) => {
    setDetailsOrg(organization);
    setDetailsUsers([]);
    setDetailsError(null);
    setShowDetails(true);
    if (!organization.id) return;
    try {
      setDetailsLoading(true);
      const users = await organizationService.getUsersByOrganization(organization.id);
      const baseUsers = Array.isArray(users) ? users : [];

      // Intentar enriquecer con rol desde el servicio de usuarios (Drimsoft)
      try {
        const drUsers = await userService.getAllUsers();
        const byId = new Map<number, any>();
        const byEmail = new Map<string, any>();
        const bySupabase = new Map<string, any>();
        const byName = new Map<string, any[]>(); // pueden existir duplicados con mismo nombre

        for (const du of drUsers) {
          const id = Number((du as any).id ?? (du as any).idUser);
          if (Number.isFinite(id)) byId.set(id, du);
          const email = String((du as any).email || '').toLowerCase().trim();
          if (email) byEmail.set(email, du);
          const supId = (du as any).supabaseUserId;
          if (typeof supId === 'string' && supId) bySupabase.set(supId, du);
          const nName = normalize((du as any).name);
          if (nName) {
            const list = byName.get(nName) || [];
            list.push(du);
            byName.set(nName, list);
          }
        }

        const normalized = baseUsers.map((u: any) => {
          const candidateIds = [
            Number(u?.id),
            Number(u?.idUser),
            Number(u?.userId),
          ].filter((n) => Number.isFinite(n)) as number[];

          const candidateEmails = [
            u?.email,
            u?.username,
            u?.mail,
            u?.correo,
            u?.emailAddress,
          ]
            .map((e: any) => (typeof e === 'string' ? e.toLowerCase().trim() : ''))
            .filter(Boolean);

          const candidateSupabase = typeof u?.supabaseUserId === 'string' ? u.supabaseUserId : undefined;
          const candidateNames = [
            u?.name,
            u?.fullName,
            `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim(),
          ]
            .map((n: any) => normalize(n))
            .filter(Boolean);

          let matched: any | undefined;

          for (const id of candidateIds) {
            if (byId.has(id)) { matched = byId.get(id); break; }
          }
          if (!matched) {
            for (const em of candidateEmails) {
              if (byEmail.has(em)) { matched = byEmail.get(em); break; }
            }
          }
          if (!matched && candidateSupabase && bySupabase.has(candidateSupabase)) {
            matched = bySupabase.get(candidateSupabase);
          }
          if (!matched) {
            for (const nn of candidateNames) {
              const list = byName.get(nn);
              if (list && list.length === 1) { matched = list[0]; break; }
            }
          }

          if (matched?.role?.name) {
            return { ...u, drimsoftRoleName: matched.role.name };
          }
          return u;
        });

        setDetailsUsers(normalized);
      } catch (mapErr) {
        // Si falla la obtención/mapeo de Drimsoft, igual mostramos los usuarios base
        setDetailsUsers(baseUsers);
      }
    } catch (e: any) {
      setDetailsError(e?.message || 'Error al cargar usuarios de la organización');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingOrganization) {
        // Update existing organization
        const updatedOrg = await organizationService.updateOrganization(
          editingOrganization.id!,
          formData as UpdateOrganizationRequest
        );
        setOrganizations(prev => prev.map(org =>
          org.id === editingOrganization.id ? updatedOrg : org
        ));
      } else {
        // Create new organization
        const newOrganization = await organizationService.createOrganization(
          formData as CreateOrganizationRequest
        );
        setOrganizations(prev => [...prev, newOrganization]);
      }

      setShowModal(false);
      setEditingOrganization(null);
    } catch (error) {
      console.error('Error saving organization:', error);
      setError('Error al guardar la organización. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingOrganization) return;

    setLoading(true);
    setError(null);

    try {
      await organizationService.deleteOrganization(deletingOrganization.id!);
      setOrganizations(prev => prev.filter(org => org.id !== deletingOrganization.id));
      setShowDeleteModal(false);
      setDeletingOrganization(null);
    } catch (error) {
      console.error('Error deleting organization:', error);
      setError('Error al eliminar la organización. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (initialLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD369] mx-auto mb-4"></div>
              <p className="text-black">Cargando organizaciones...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-[#FFD369] to-[#FFD369]/80 rounded-xl">
              <Building2 className="w-6 h-6 text-[#222831]" />
            </div>
            <h1 className="text-3xl font-bold text-[#222831]">Organizaciones</h1>
          </div>
          <p className="text-black">Gestiona las organizaciones que utilizan Planifika para sus proyectos</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar organizaciones en Planifika..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') triggerSearch(); }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD369] focus:border-transparent transition-all duration-300 text-black"
                />
                <button
                  onClick={triggerSearch}
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#FFD369] text-[#222831] rounded-lg text-sm shadow hover:bg-[#FFD369]/90 disabled:opacity-50"
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD369] to-[#FFD369]/90 text-[#222831] rounded-xl hover:from-[#FFD369]/90 hover:to-[#FFD369]/80 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Nueva Organización
            </button>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-black">
              Mostrando {organizations.length} de {totalElements} organizaciones
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 border border-gray-200 rounded-lg text-black disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-black text-sm">Página {page + 1} de {Math.max(1, totalPages)}</span>
              {/* Campo para ir a una página específica */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, totalPages)}
                  placeholder="Ir a..."
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-black"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.currentTarget as HTMLInputElement;
                      const value = Number(target.value);
                      if (!Number.isNaN(value)) {
                        const clamped = Math.min(Math.max(1, value), Math.max(1, totalPages));
                        setPage(clamped - 1);
                      }
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const container = (e.currentTarget.parentElement as HTMLElement);
                    const input = container.querySelector('input[type="number"]') as HTMLInputElement | null;
                    if (input) {
                      const value = Number(input.value);
                      if (!Number.isNaN(value)) {
                        const clamped = Math.min(Math.max(1, value), Math.max(1, totalPages));
                        setPage(clamped - 1);
                      }
                    }
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-black"
                >
                  Ir
                </button>
              </div>
              <button
                onClick={() => setPage((p) => (totalPages ? Math.min(totalPages - 1, p + 1) : p + 1))}
                disabled={totalPages ? page >= totalPages - 1 : organizations.length === 0}
                className="px-4 py-2 border border-gray-200 rounded-lg text-black disabled:opacity-50"
              >
                Siguiente
              </button>
              <select
                className="ml-2 px-3 py-2 border border-gray-200 rounded-lg text-black"
                value={size}
                onChange={(e) => { setPage(0); setSize(parseInt(e.target.value)); }}
              >
                {[6, 12, 24, 48].map((opt) => (
                  <option key={opt} value={opt}>{opt}/página</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Organizations Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOrganizations.map((org) => (
            <div key={org.id || `org-${org.nit}`} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Photo */}
              <div className="h-48 bg-gradient-to-br from-[#FFD369] to-[#FFD369]/80 relative overflow-hidden">
                {org.photoURL ? (
                  <img
                    src={org.photoURL}
                    alt={org.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center ${org.photoURL ? 'hidden' : ''}`}>
                  <Building2 className="w-16 h-16 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#222831] mb-2 line-clamp-2">{org.name}</h3>
                <p className="text-sm text-gray-600 mb-3 font-medium">NIT: {org.nit}</p>

                {org.address && (
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-black line-clamp-2">{org.address}</p>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {org.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-black">{org.phone}</span>
                    </div>
                  )}

                  {org.domain && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-black">{org.domain}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-black font-medium">
                      {typeof org.id === 'number' && usersCountByOrg[org.id] !== undefined
                        ? `${usersCountByOrg[org.id].toLocaleString()} miembros`
                        : '— miembros'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleViewDetails(org)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-[#222831] rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button
                    onClick={() => handleEdit(org)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#FFD369] text-[#222831] rounded-lg hover:bg-[#FFD369]/90 transition-colors duration-200 font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(org)}
                    className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrganizations.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">No se encontraron organizaciones</h3>
              <p className="text-black">Intenta ajustar los filtros o crear una nueva organización en Planifika</p>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-[#222831]">
                  {editingOrganization ? 'Editar Organización' : 'Nueva Organización'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      NIT *
                    </label>
                    <input
                      type="text"
                      name="nit"
                      value={formData.nit}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: 12345678-9"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD369] focus:border-transparent transition-all duration-300 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD369] focus:border-transparent transition-all duration-300 text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD369] focus:border-transparent transition-all duration-300 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Dominio
                    </label>
                    <input
                      type="text"
                      name="domain"
                      value={formData.domain}
                      onChange={handleInputChange}
                      placeholder="Ej: empresa.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD369] focus:border-transparent transition-all duration-300 text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD369] focus:border-transparent transition-all duration-300 text-black"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-black border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-[#FFD369] to-[#FFD369]/90 text-[#222831] rounded-xl hover:from-[#FFD369]/90 hover:to-[#FFD369]/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Guardando...' : editingOrganization ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingOrganization && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#222831]">Confirmar eliminación</h3>
                    <p className="text-black">Esta acción no se puede deshacer</p>
                  </div>
                </div>

                <p className="text-black mb-4">
                  ¿Estás seguro de que quieres eliminar la organización{' '}
                  <span className="font-semibold">{deletingOrganization.name}</span>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-1">¡Advertencia!</h4>
                      <p className="text-sm text-red-700">
                        Esta organización puede tener miles de usuarios asociados.
                        Esta acción eliminará permanentemente la organización y puede afectar
                        a todos los usuarios vinculados.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-3 text-black border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={loading}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetails && detailsOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-[#FFD369] to-[#FFD369]/80 rounded-xl">
                    <Building2 className="w-6 h-6 text-[#222831]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#222831]">{detailsOrg.name}</h2>
                    <p className="text-sm text-gray-600">NIT: {detailsOrg.nit}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowDetails(false); setDetailsOrg(null); }}
                  className="px-4 py-2 text-black border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  Cerrar
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Org summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <div className="h-40 bg-gradient-to-br from-[#FFD369] to-[#FFD369]/80 rounded-xl overflow-hidden flex items-center justify-center">
                      {detailsOrg.photoURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={detailsOrg.photoURL} alt={detailsOrg.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-14 h-14 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    {detailsOrg.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-sm text-black">{detailsOrg.address}</span>
                      </div>
                    )}
                    {detailsOrg.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-black">{detailsOrg.phone}</span>
                      </div>
                    )}
                    {detailsOrg.domain && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-black">{detailsOrg.domain}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-black font-medium">
                        {detailsUsers.length} miembros (listado detallado abajo)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Users list */}
                <div>
                  <h3 className="text-lg font-semibold text-[#222831] mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-600" />
                    Usuarios de la organización
                  </h3>

                  {detailsError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      {detailsError}
                    </div>
                  )}

                  {detailsLoading ? (
                    <div className="flex items-center gap-3 text-black">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FFD369]"></div>
                      Cargando usuarios...
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="max-h-[40vh] overflow-y-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider px-4 py-3">Nombre</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {detailsUsers.length === 0 ? (
                              <tr>
                                <td colSpan={1} className="px-4 py-6 text-center text-black">No hay usuarios para esta organización</td>
                              </tr>
                            ) : (
                              detailsUsers.map((u, idx) => (
                                <tr key={u.id || u.idUser || idx} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-black">
                                    {u.name || u.fullName || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '-'}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
