import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Edit3,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
  XCircle,
} from 'lucide-react';

import facilityService from '../../services/facilityService';

import './OfficerFacilities.css';

const EMPTY_FORM = {
  name: '',
  description: '',
  location: '',
  capacity: 1,
  status: 'available',
  is_bookable: true,
};

function formatStatus(status) {
  const labels = {
    available: 'Available',
    maintenance: 'Maintenance',
    inactive: 'Inactive',
  };

  return labels[status] || status;
}

function OfficerFacilities() {
  const [facilities, setFacilities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [formOpen, setFormOpen] = useState(false);
  const [editingFacility, setEditingFacility] =
    useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadFacilities = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const data =
          await facilityService.getManagementFacilities();

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        setFacilities(items);
      } catch (requestError) {
        console.error(
          'Unable to load facilities:',
          requestError,
        );

        setError(
          'Unable to load facilities. Please try again.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  const availableCount = facilities.filter(
    (facility) => facility.status === 'available',
  ).length;

  const maintenanceCount = facilities.filter(
    (facility) => facility.status === 'maintenance',
  ).length;

  const inactiveCount = facilities.filter(
    (facility) => facility.status === 'inactive',
  ).length;

  const totalCapacity = facilities.reduce(
    (total, facility) =>
      total + Number(facility.capacity || 0),
    0,
  );

  const filteredFacilities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...facilities]
      .filter((facility) => {
        const name =
          facility.name?.toLowerCase() || '';

        const description =
          facility.description?.toLowerCase() || '';

        const location =
          facility.location?.toLowerCase() || '';

        const status = formatStatus(
          facility.status,
        ).toLowerCase();

        const matchesSearch =
          !query ||
          name.includes(query) ||
          description.includes(query) ||
          location.includes(query) ||
          status.includes(query);

        const matchesStatus =
          statusFilter === 'All' ||
          facility.status ===
            statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) =>
        (a.name || '').localeCompare(
          b.name || '',
        ),
      );
  }, [
    facilities,
    search,
    statusFilter,
  ]);

  const openCreateForm = () => {
    setEditingFacility(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setFormOpen(true);
  };

  const openEditForm = (facility) => {
    setEditingFacility(facility);

    setForm({
      name: facility.name || '',
      description: facility.description || '',
      location: facility.location || '',
      capacity: facility.capacity || 1,
      status: facility.status || 'available',
      is_bookable: Boolean(
        facility.is_bookable,
      ),
    });

    setFormError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingFacility(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'capacity'
            ? Math.max(1, Number(value))
            : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setFormError(
        'Facility name is required.',
      );
      return;
    }

    if (!form.location.trim()) {
      setFormError(
        'Facility location is required.',
      );
      return;
    }

    if (
      !form.capacity ||
      Number(form.capacity) < 1
    ) {
      setFormError(
        'Capacity must be at least 1.',
      );
      return;
    }

    setSaving(true);
    setFormError('');
    setError('');

    const payload = {
      name,
      description: form.description.trim(),
      location: form.location.trim(),
      capacity: Number(form.capacity),
      status: form.status,
      is_bookable:
        form.status === 'available'
          ? form.is_bookable
          : false,
    };

    try {
      if (editingFacility) {
        const updated =
          await facilityService.updateFacility(
            editingFacility.id,
            payload,
          );

        setFacilities((current) =>
          current.map((facility) =>
            facility.id ===
            editingFacility.id
              ? updated
              : facility,
          ),
        );

        setSuccessMessage(
          'Facility updated successfully.',
        );
      } else {
        const created =
          await facilityService.createFacility(
            payload,
          );

        setFacilities((current) => [
          ...current,
          created,
        ]);

        setSuccessMessage(
          'Facility created successfully.',
        );
      }

      closeForm();

      window.setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (requestError) {
      console.error(
        'Unable to save facility:',
        requestError,
      );

      const responseData =
        requestError.response?.data;

      if (
        responseData &&
        typeof responseData === 'object'
      ) {
        const firstError = Object.values(
          responseData,
        )[0];

        if (Array.isArray(firstError)) {
          setFormError(firstError[0]);
        } else if (
          typeof firstError === 'string'
        ) {
          setFormError(firstError);
        } else {
          setFormError(
            'Unable to save this facility.',
          );
        }
      } else {
        setFormError(
          'Unable to save this facility. Please try again.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (
    facility,
  ) => {
    const nextStatus =
      facility.status === 'available'
        ? 'maintenance'
        : 'available';

    try {
      const updated =
        await facilityService.updateFacility(
          facility.id,
          {
            status: nextStatus,
            is_bookable:
              nextStatus === 'available'
                ? facility.is_bookable
                : false,
          },
        );

      setFacilities((current) =>
        current.map((item) =>
          item.id === facility.id
            ? updated
            : item,
        ),
      );

      setSuccessMessage(
        `Facility marked as ${formatStatus(
          nextStatus,
        ).toLowerCase()}.`,
      );

      window.setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (requestError) {
      console.error(
        'Unable to update facility status:',
        requestError,
      );

      setError(
        'Unable to update facility status.',
      );
    }
  };

  const handleBookableToggle = async (
    facility,
  ) => {
    if (facility.status !== 'available') {
      return;
    }

    try {
      const updated =
        await facilityService.updateFacility(
          facility.id,
          {
            is_bookable:
              !facility.is_bookable,
          },
        );

      setFacilities((current) =>
        current.map((item) =>
          item.id === facility.id
            ? updated
            : item,
        ),
      );
    } catch (requestError) {
      console.error(
        'Unable to update booking access:',
        requestError,
      );

      setError(
        'Unable to update booking access.',
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await facilityService.deleteFacility(
        deleteTarget.id,
      );

      setFacilities((current) =>
        current.filter(
          (facility) =>
            facility.id !==
            deleteTarget.id,
        ),
      );

      setDeleteTarget(null);

      setSuccessMessage(
        'Facility deleted successfully.',
      );

      window.setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (requestError) {
      console.error(
        'Unable to delete facility:',
        requestError,
      );

      setError(
        'Unable to delete this facility. Please try again.',
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="officer-facilities-page">
      <div className="officer-page-container">
        {/* HEADER */}
        <header className="officer-facilities-header">
          <div>
            <span className="officer-dashboard-eyebrow">
              Officer Portal
            </span>

            <h1>Facility Management</h1>

            <p>
              Manage ICT facilities, availability,
              capacity and booking access from one
              place.
            </p>
          </div>

          <div className="officer-facilities-header-actions">
            <button
              type="button"
              className="officer-refresh-button"
              onClick={() =>
                loadFacilities(true)
              }
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? 'officer-refreshing'
                    : ''
                }
              />

              {refreshing
                ? 'Refreshing...'
                : 'Refresh'}
            </button>

            <button
              type="button"
              className="btn btn-primary officer-facility-create"
              onClick={openCreateForm}
            >
              <Plus size={17} />
              Add Facility
            </button>
          </div>
        </header>

        {/* SUCCESS */}
        {successMessage && (
          <div className="officer-facility-success">
            <CheckCircle2 size={18} />

            <span>{successMessage}</span>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage('')
              }
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="officer-facilities-error">
            <AlertCircle size={18} />

            <div>
              <strong>
                Something went wrong
              </strong>

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() =>
                loadFacilities()
              }
            >
              Try again
            </button>
          </div>
        )}

        {/* STATS */}
        {!loading && (
          <div className="officer-facility-stats">
            <div className="officer-facility-stat stat-blue">
              <div className="facility-stat-icon">
                <Building2 size={20} />
              </div>

              <div>
                <span>Total Facilities</span>
                <strong>
                  {facilities.length}
                </strong>
              </div>
            </div>

            <div className="officer-facility-stat stat-emerald">
              <div className="facility-stat-icon">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <span>Available</span>
                <strong>
                  {availableCount}
                </strong>
              </div>
            </div>

            <div className="officer-facility-stat stat-amber">
              <div className="facility-stat-icon">
                <AlertCircle size={20} />
              </div>

              <div>
                <span>Maintenance</span>
                <strong>
                  {maintenanceCount}
                </strong>
              </div>
            </div>

            <div className="officer-facility-stat stat-indigo">
              <div className="facility-stat-icon">
                <Users size={20} />
              </div>

              <div>
                <span>Total Capacity</span>
                <strong>
                  {totalCapacity}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* TOOLBAR */}
        {!loading && !error && (
          <div className="officer-facilities-toolbar">
            <div className="officer-facility-search">
              <Search size={18} />

              <input
                type="search"
                value={search}
                placeholder="Search facilities..."
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch('')
                  }
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="officer-facility-filters">
              {[
                'All',
                'Available',
                'Maintenance',
                'Inactive',
              ].map((status) => (
                <button
                  type="button"
                  key={status}
                  className={
                    statusFilter === status
                      ? 'facility-filter active'
                      : 'facility-filter'
                  }
                  onClick={() =>
                    setStatusFilter(status)
                  }
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <div className="officer-facilities-loading">
            <div className="officer-loading-spinner" />

            <strong>
              Loading facilities
            </strong>

            <span>
              Retrieving facility management
              data...
            </span>
          </div>
        ) : (
          !error && (
            <div className="officer-facilities-results">
              <div className="officer-facilities-results-header">
                <div>
                  <span>FACILITIES</span>
                  <h2>
                    ICT Centre Facilities
                  </h2>
                </div>

                <p>
                  {filteredFacilities.length}{' '}
                  {filteredFacilities.length ===
                  1
                    ? 'facility'
                    : 'facilities'}{' '}
                  shown
                </p>
              </div>

              {filteredFacilities.length > 0 ? (
                <div className="officer-facility-grid">
                  {filteredFacilities.map(
                    (facility) => (
                      <article
                        className="officer-facility-card"
                        key={facility.id}
                      >
                        <div className="officer-facility-card-top">
                          <div className="officer-facility-icon">
                            <Building2 size={21} />
                          </div>

                          <span
                            className={`facility-status ${facility.status}`}
                          >
                            <span />
                            {formatStatus(
                              facility.status,
                            )}
                          </span>
                        </div>

                        <div className="officer-facility-content">
                          <span className="facility-type">
                            ICT Facility
                          </span>

                          <h3>
                            {facility.name}
                          </h3>

                          <p>
                            {facility.description ||
                              'No description provided.'}
                          </p>

                          <div className="facility-details">
                            <span>
                              <MapPin size={14} />
                              {facility.location ||
                                'Location not specified'}
                            </span>

                            <span>
                              <Users size={14} />
                              {facility.capacity}{' '}
                              seats
                            </span>
                          </div>

                          <button
                            type="button"
                            className={`facility-booking-access ${
                              facility.is_bookable
                                ? 'enabled'
                                : 'disabled'
                            }`}
                            onClick={() =>
                              handleBookableToggle(
                                facility,
                              )
                            }
                            disabled={
                              facility.status !==
                              'available'
                            }
                          >
                            <span />

                            {facility.is_bookable
                              ? 'Booking enabled'
                              : 'Booking disabled'}
                          </button>
                        </div>

                        <div className="officer-facility-actions">
                          <button
                            type="button"
                            className="facility-action edit"
                            onClick={() =>
                              openEditForm(
                                facility,
                              )
                            }
                          >
                            <Edit3 size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="facility-action status"
                            onClick={() =>
                              handleStatusToggle(
                                facility,
                              )
                            }
                          >
                            {facility.status ===
                            'available'
                              ? 'Maintenance'
                              : 'Available'}
                          </button>

                          <button
                            type="button"
                            className="facility-action delete"
                            onClick={() =>
                              setDeleteTarget(
                                facility,
                              )
                            }
                            aria-label={`Delete ${facility.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </article>
                    ),
                  )}
                </div>
              ) : (
                <div className="officer-facilities-empty">
                  <div>
                    <Search size={25} />
                  </div>

                  <h3>
                    No facilities found
                  </h3>

                  <p>
                    No facilities match your
                    current search or filter.
                  </p>

                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('All');
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {formOpen && (
        <div
          className="officer-facility-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !saving
            ) {
              closeForm();
            }
          }}
        >
          <div className="officer-facility-form-modal">
            <div className="facility-form-header">
              <div>
                <span>
                  {editingFacility
                    ? 'EDIT FACILITY'
                    : 'NEW FACILITY'}
                </span>

                <h2>
                  {editingFacility
                    ? 'Update facility'
                    : 'Add facility'}
                </h2>

                <p>
                  {editingFacility
                    ? 'Update the facility information and booking settings.'
                    : 'Add a new facility to the ICT Centre.'}
                </p>
              </div>

              <button
                type="button"
                className="facility-modal-close"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {formError && (
              <div className="facility-form-error">
                <AlertCircle size={17} />
                <span>{formError}</span>
              </div>
            )}

            <form
              className="facility-form"
              onSubmit={handleSubmit}
            >
              <div className="facility-form-field">
                <label htmlFor="facility-name">
                  Facility Name
                </label>

                <input
                  id="facility-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Computer Laboratory"
                  disabled={saving}
                />
              </div>

              <div className="facility-form-field">
                <label htmlFor="facility-location">
                  Location
                </label>

                <input
                  id="facility-location"
                  name="location"
                  type="text"
                  value={form.location}
                  onChange={handleFormChange}
                  placeholder="e.g. ICT Centre — Main Lab"
                  disabled={saving}
                />
              </div>

              <div className="facility-form-row">
                <div className="facility-form-field">
                  <label htmlFor="facility-capacity">
                    Capacity
                  </label>

                  <input
                    id="facility-capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>

                <div className="facility-form-field">
                  <label htmlFor="facility-status">
                    Status
                  </label>

                  <select
                    id="facility-status"
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    disabled={saving}
                  >
                    <option value="available">
                      Available
                    </option>

                    <option value="maintenance">
                      Under Maintenance
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              <div className="facility-form-field">
                <label htmlFor="facility-description">
                  Description
                </label>

                <textarea
                  id="facility-description"
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Describe this facility..."
                  disabled={saving}
                />
              </div>

              <label className="facility-bookable-toggle">
                <input
                  type="checkbox"
                  name="is_bookable"
                  checked={form.is_bookable}
                  onChange={handleFormChange}
                  disabled={
                    saving ||
                    form.status !==
                      'available'
                  }
                />

                <span>
                  <strong>
                    Allow student bookings
                  </strong>

                  <small>
                    Students can request this
                    facility when booking access is
                    enabled.
                  </small>
                </span>
              </label>

              <div className="facility-form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={15}
                        className="officer-refreshing"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingFacility ? (
                        <Edit3 size={15} />
                      ) : (
                        <Plus size={15} />
                      )}

                      {editingFacility
                        ? 'Save Changes'
                        : 'Create Facility'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div
          className="officer-facility-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !deleting
            ) {
              setDeleteTarget(null);
            }
          }}
        >
          <div className="officer-facility-modal">
            <button
              type="button"
              className="facility-modal-close"
              onClick={() =>
                !deleting &&
                setDeleteTarget(null)
              }
              disabled={deleting}
              aria-label="Close"
            >
              <XCircle size={19} />
            </button>

            <div className="facility-delete-icon">
              <Trash2 size={23} />
            </div>

            <span>Delete facility</span>

            <h2>Are you sure?</h2>

            <p>
              You are about to permanently delete{' '}
              <strong>
                “{deleteTarget.name}”
              </strong>
              . This action cannot be undone.
            </p>

            <div className="facility-modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="facility-delete-confirm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <RefreshCw
                      size={15}
                      className="officer-refreshing"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OfficerFacilities;