import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Trash2,
  Wifi,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../../config/api';

import './AdminFacilities.css';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'available', label: 'Available' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inactive', label: 'Inactive' },
];

const getResults = (data) => {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.results) ? data.results : [];
};

const getErrorMessage = (error) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  'Unable to load facilities. Please try again.';

const getFacilityName = (facility) =>
  facility?.name ||
  facility?.title ||
  facility?.facility_name ||
  'Unnamed facility';

const getFacilityLocation = (facility) =>
  facility?.location ||
  facility?.room ||
  facility?.building ||
  facility?.description ||
  'Kiangini ICT Centre';

const getFacilityStatus = (facility) => {
  if (facility?.is_active === false || facility?.active === false) {
    return 'inactive';
  }

  const rawStatus = String(
    facility?.status || facility?.availability_status || 'available',
  ).toLowerCase();

  if (
    rawStatus.includes('maintenance') ||
    rawStatus.includes('maintain')
  ) {
    return 'maintenance';
  }

  return 'available';
};

const getStatusLabel = (status) => {
  const labels = {
    available: 'Available',
    maintenance: 'Maintenance',
    inactive: 'Inactive',
  };

  return labels[status] || 'Available';
};

function AdminFacilities() {
  const [facilities, setFacilities] = useState([]);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [openMenu, setOpenMenu] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadFacilities = useCallback(
    async (isRefresh = false) => {
      try {
        setError('');

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = {
          page,
          page_size: PAGE_SIZE,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        if (status !== 'all') {
          params.status = status;
        }

        const response = await api.get('/facilities/management/', {
          params,
        });

        setFacilities(getResults(response.data));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, status],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFacilities();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadFacilities]);

  const stats = useMemo(() => {
    return facilities.reduce(
      (result, facility) => {
        const currentStatus = getFacilityStatus(facility);

        result.total += 1;

        if (currentStatus === 'available') {
          result.available += 1;
        }

        if (currentStatus === 'maintenance') {
          result.maintenance += 1;
        }

        if (currentStatus === 'inactive') {
          result.inactive += 1;
        }

        return result;
      },
      {
        total: 0,
        available: 0,
        maintenance: 0,
        inactive: 0,
      },
    );
  }, [facilities]);

  const updateFacility = async (id, payload) => {
    try {
      setError('');

      await api.patch(`/facilities/management/${id}/`, payload);

      setOpenMenu(null);
      await loadFacilities(true);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Unable to update facility.',
      );
    }
  };

  const deleteFacility = async () => {
    if (!deleteTarget) return;

    try {
      setError('');

      await api.delete(
        `/facilities/management/${deleteTarget.id}/`,
      );

      setDeleteTarget(null);
      setOpenMenu(null);

      await loadFacilities(true);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Unable to delete facility.',
      );
    }
  };

  return (
    <main className="admin-facilities">
      <div className="admin-facilities-container">
        <header className="admin-facilities-header">
          <div>
            <span className="admin-facilities-eyebrow">
              <Building2 size={15} />
              Infrastructure
            </span>

            <h1>Facilities Management</h1>

            <p>
              Manage ICT facilities, availability and maintenance
              status across Kiangini ICT Centre.
            </p>
          </div>

          <div className="admin-facilities-header-actions">
            <button
              type="button"
              className="admin-facilities-refresh"
              onClick={() => loadFacilities(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={17}
                className={
                  refreshing ? 'admin-facility-refresh-spin' : ''
                }
              />
              Refresh
            </button>

            <Link
              to="/admin/facilities/new"
              className="admin-facilities-add"
            >
              <Plus size={17} />
              Add facility
            </Link>
          </div>
        </header>

        {error && (
          <div className="admin-facilities-alert">
            <XCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <section className="admin-facility-summary">
          <article className="admin-facility-stat total">
            <div className="admin-facility-stat-icon">
              <Building2 size={19} />
            </div>

            <div>
              <strong>{stats.total}</strong>
              <span>Total facilities</span>
            </div>
          </article>

          <article className="admin-facility-stat available">
            <div className="admin-facility-stat-icon">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <strong>{stats.available}</strong>
              <span>Available</span>
            </div>
          </article>

          <article className="admin-facility-stat maintenance">
            <div className="admin-facility-stat-icon">
              <Settings2 size={19} />
            </div>

            <div>
              <strong>{stats.maintenance}</strong>
              <span>Maintenance</span>
            </div>
          </article>

          <article className="admin-facility-stat inactive">
            <div className="admin-facility-stat-icon">
              <XCircle size={19} />
            </div>

            <div>
              <strong>{stats.inactive}</strong>
              <span>Inactive</span>
            </div>
          </article>
        </section>

        <section className="admin-facilities-panel">
          <div className="admin-facilities-toolbar">
            <div className="admin-facilities-search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search facilities..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="admin-facilities-filter">
              <Filter size={17} />

              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-facilities-grid">
            {loading ? (
              <div className="admin-facilities-loading">
                <RefreshCw
                  size={23}
                  className="admin-facility-refresh-spin"
                />
                <span>Loading facilities...</span>
              </div>
            ) : facilities.length === 0 ? (
              <div className="admin-facilities-empty">
                <Building2 size={30} />

                <strong>No facilities found</strong>

                <span>
                  Try changing your search or status filter.
                </span>

                <Link to="/admin/facilities/new">
                  <Plus size={16} />
                  Add facility
                </Link>
              </div>
            ) : (
              facilities.map((facility) => {
                const currentStatus =
                  getFacilityStatus(facility);

                return (
                  <article
                    className="admin-facility-card"
                    key={facility.id}
                  >
                    <div className="admin-facility-card-top">
                      <div className="admin-facility-card-icon">
                        <Wifi size={22} />
                      </div>

                      <div className="admin-facility-card-actions">
                        <button
                          type="button"
                          className="admin-facility-more"
                          onClick={() =>
                            setOpenMenu(
                              openMenu === facility.id
                                ? null
                                : facility.id,
                            )
                          }
                          aria-label="Facility actions"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {openMenu === facility.id && (
                          <div className="admin-facility-menu">
                            <Link
                              to={`/admin/facilities/${facility.id}/edit`}
                              onClick={() => setOpenMenu(null)}
                            >
                              <Edit3 size={15} />
                              Edit facility
                            </Link>

                            {currentStatus === 'available' && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateFacility(
                                    facility.id,
                                    {
                                      status: 'maintenance',
                                    },
                                  )
                                }
                              >
                                <Settings2 size={15} />
                                Mark maintenance
                              </button>
                            )}

                            {currentStatus === 'maintenance' && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateFacility(
                                    facility.id,
                                    {
                                      status: 'available',
                                    },
                                  )
                                }
                              >
                                <CheckCircle2 size={15} />
                                Mark available
                              </button>
                            )}

                            {currentStatus !== 'inactive' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  updateFacility(
                                    facility.id,
                                    {
                                      is_active: false,
                                    },
                                  )
                                }
                              >
                                <XCircle size={15} />
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  updateFacility(
                                    facility.id,
                                    {
                                      is_active: true,
                                      status: 'available',
                                    },
                                  )
                                }
                              >
                                <CheckCircle2 size={15} />
                                Activate
                              </button>
                            )}

                            <button
                              type="button"
                              className="danger"
                              onClick={() => {
                                setDeleteTarget(facility);
                                setOpenMenu(null);
                              }}
                            >
                              <Trash2 size={15} />
                              Delete facility
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="admin-facility-card-body">
                      <span
                        className={`admin-facility-status ${currentStatus}`}
                      >
                        <span />
                        {getStatusLabel(currentStatus)}
                      </span>

                      <h2>{getFacilityName(facility)}</h2>

                      <p>{getFacilityLocation(facility)}</p>

                      {facility?.description && (
                        <div className="admin-facility-description">
                          {facility.description}
                        </div>
                      )}
                    </div>

                    <footer className="admin-facility-card-footer">
                      <span>
                        {facility?.capacity
                          ? `${facility.capacity} capacity`
                          : 'ICT facility'}
                      </span>

                      <Link
                        to={`/admin/facilities/${facility.id}/edit`}
                      >
                        Manage
                      </Link>
                    </footer>
                  </article>
                );
              })
            )}
          </div>

          <footer className="admin-facilities-pagination">
            <span>Page {page}</span>

            <div>
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1),
                  )
                }
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <button
                type="button"
                disabled={
                  loading || facilities.length < PAGE_SIZE
                }
                onClick={() =>
                  setPage((current) => current + 1)
                }
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          </footer>
        </section>
      </div>

      {deleteTarget && (
        <div
          className="admin-facility-modal-backdrop"
          onMouseDown={() => setDeleteTarget(null)}
        >
          <div
            className="admin-facility-delete-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="admin-facility-delete-icon">
              <Trash2 size={21} />
            </div>

            <h2>Delete facility?</h2>

            <p>
              You are about to permanently delete{' '}
              <strong>
                {getFacilityName(deleteTarget)}
              </strong>
              . This action cannot be undone.
            </p>

            <div className="admin-facility-modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="danger"
                onClick={deleteFacility}
              >
                <Trash2 size={16} />
                Delete facility
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminFacilities;