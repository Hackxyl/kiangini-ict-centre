import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Edit3,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../config/api";
import "./AdminUsers.css";

const PAGE_SIZE = 10;

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "student", label: "Students" },
  { value: "officer", label: "Officers" },
  { value: "admin", label: "Administrators" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const getResults = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.users)) return data.users;
  return [];
};

const getTotal = (data, fallback) => {
  if (typeof data?.count === "number") return data.count;
  if (typeof data?.total === "number") return data.total;
  if (typeof data?.total_users === "number") return data.total_users;
  return fallback;
};

const getDisplayName = (user) => {
  const fullName =
    user?.full_name ||
    user?.name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

  return fullName || user?.email || "Unnamed user";
};

const getInitials = (user) => {
  const name = getDisplayName(user);

  if (!name) return "U";

  const parts = name.split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getRoleLabel = (role) => {
  switch (role) {
    case "admin":
      return "Administrator";
    case "officer":
      return "Officer";
    case "student":
      return "Student";
    default:
      return role || "Unknown";
  }
};

const getRoleClass = (role) => {
  switch (role) {
    case "admin":
      return "admin";
    case "officer":
      return "officer";
    case "student":
      return "student";
    default:
      return "default";
  }
};

const getStatus = (user) => {
  return user?.is_active === false ? "inactive" : "active";
};

const getStatusLabel = (user) => {
  return getStatus(user) === "active" ? "Active" : "Inactive";
};

const getJoinedDate = (user) => {
  const value = user?.date_joined || user?.created_at;

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;

  if (data?.detail) return data.detail;

  if (data?.message) return data.message;

  if (data && typeof data === "object") {
    const firstError = Object.values(data).flat()?.[0];

    if (firstError) return String(firstError);
  }

  return "Something went wrong. Please try again.";
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const loadUsers = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = {
          page,
          page_size: PAGE_SIZE,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        if (role) {
          params.role = role;
        }

        if (status) {
          params.status = status;
        }

        const response = await api.get("/auth/users/", { params });

        const results = getResults(response.data);

        setUsers(results);
        setTotalUsers(getTotal(response.data, results.length));
      } catch (err) {
        console.error("Failed to load users:", err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, role, search, status],
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const handleClick = () => {
      setOpenMenu(null);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const stats = useMemo(() => {
    const total = totalUsers;

    const students = users.filter(
      (user) => user.role === "student",
    ).length;

    const officers = users.filter(
      (user) => user.role === "officer",
    ).length;

    const admins = users.filter(
      (user) => user.role === "admin",
    ).length;

    const active = users.filter(
      (user) => getStatus(user) === "active",
    ).length;

    return {
      total,
      students,
      officers,
      admins,
      active,
    };
  }, [totalUsers, users]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalUsers / PAGE_SIZE),
  );

  const startItem =
    totalUsers === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(
    page * PAGE_SIZE,
    totalUsers,
  );

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleRoleChange = (event) => {
    setRole(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setRole("");
    setStatus("");
    setPage(1);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setDeleteLoading(true);
      setError("");

      await api.delete(`/auth/users/${selectedUser.id}/`);

      setSelectedUser(null);

      if (users.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadUsers();
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      setStatusLoading(true);
      setOpenMenu(null);
      setError("");

      await api.patch(`/auth/users/${user.id}/`, {
        is_active: !user.is_active,
      });

      await loadUsers();
    } catch (err) {
      console.error("Failed to update user:", err);
      setError(getErrorMessage(err));
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="admin-users">
      <div className="admin-users-container">

        {/* HEADER */}
        <header className="admin-users-header">
          <div>
            <div className="admin-users-eyebrow">
              <span className="admin-users-eyebrow-dot" />
              Administration
            </div>

            <h1>User Management</h1>

            <p>
              Manage students, officers and administrators
              across Kiangini ICT Centre.
            </p>
          </div>

          <div className="admin-users-header-actions">
            <button
              type="button"
              className="admin-users-refresh"
              onClick={() => loadUsers(true)}
              disabled={loading || refreshing}
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "admin-users-refresh-spinning"
                    : ""
                }
              />
              Refresh
            </button>

            <Link
              to="/admin/users/new"
              className="admin-users-add-button"
            >
              <Plus size={17} />
              Add User
            </Link>
          </div>
        </header>

        {/* ERROR */}
        {error && (
          <div className="admin-users-error">
            <Activity size={17} />

            <div>
              <strong>Unable to complete request</strong>
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <section className="admin-users-stats">

          <div className="admin-users-stat-card">
            <div className="admin-users-stat-icon blue">
              <Users size={19} />
            </div>

            <div>
              <span>Total users</span>
              <strong>{totalUsers}</strong>
            </div>
          </div>

          <div className="admin-users-stat-card">
            <div className="admin-users-stat-icon green">
              <UserCheck size={19} />
            </div>

            <div>
              <span>Active users</span>
              <strong>{stats.active}</strong>
            </div>
          </div>

          <div className="admin-users-stat-card">
            <div className="admin-users-stat-icon cyan">
              <UserPlus size={19} />
            </div>

            <div>
              <span>Students</span>
              <strong>{stats.students}</strong>
            </div>
          </div>

          <div className="admin-users-stat-card">
            <div className="admin-users-stat-icon indigo">
              <UserCog size={19} />
            </div>

            <div>
              <span>Staff & admins</span>
              <strong>
                {stats.officers + stats.admins}
              </strong>
            </div>
          </div>

        </section>

        {/* FILTERS */}
        <section className="admin-users-toolbar">

          <div className="admin-users-search">
            <Search size={17} />

            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name, email or student ID..."
              aria-label="Search users"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            value={role}
            onChange={handleRoleChange}
            aria-label="Filter by role"
          >
            {ROLE_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={handleStatusChange}
            aria-label="Filter by status"
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

          {(search || role || status) && (
            <button
              type="button"
              className="admin-users-clear-filters"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}

        </section>

        {/* TABLE */}
        <section className="admin-users-table-card">

          <div className="admin-users-table-header">
            <div>
              <span className="admin-users-table-kicker">
                Directory
              </span>

              <h2>System users</h2>
            </div>

            <span className="admin-users-result-count">
              {totalUsers}{" "}
              {totalUsers === 1 ? "user" : "users"}
            </span>
          </div>

          {loading ? (
            <div className="admin-users-loading">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  className="admin-users-loading-row"
                  key={index}
                >
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="admin-users-empty">
              <div className="admin-users-empty-icon">
                <Users size={28} />
              </div>

              <h3>No users found</h3>

              <p>
                Try adjusting your search or filters,
                or create a new user.
              </p>

              {(search || role || status) && (
                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="admin-users-table-wrapper">
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Student ID</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>

                        <td>
                          <div className="admin-user-identity">
                            <div
                              className={`admin-user-avatar ${getRoleClass(
                                user.role,
                              )}`}
                            >
                              {getInitials(user)}
                            </div>

                            <div>
                              <strong>
                                {getDisplayName(user)}
                              </strong>

                              <span>
                                {user.email || "No email"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`admin-user-role ${getRoleClass(
                              user.role,
                            )}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </td>

                        <td>
                          <span className="admin-user-id">
                            {user.student_id || "—"}
                          </span>
                        </td>

                        <td>
                          <span className="admin-user-contact">
                            {user.phone || "—"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`admin-user-status ${getStatus(
                              user,
                            )}`}
                          >
                            <i />
                            {getStatusLabel(user)}
                          </span>
                        </td>

                        <td>
                          <span className="admin-user-date">
                            {getJoinedDate(user)}
                          </span>
                        </td>

                        <td>
                          <div className="admin-user-actions">
                            <button
                              type="button"
                              className="admin-user-menu-button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setOpenMenu(
                                  openMenu === user.id
                                    ? null
                                    : user.id,
                                );
                              }}
                              aria-label={`Actions for ${getDisplayName(
                                user,
                              )}`}
                            >
                              <MoreHorizontal size={18} />
                            </button>

                            {openMenu === user.id && (
                              <div
                                className="admin-user-menu"
                                onClick={(event) =>
                                  event.stopPropagation()
                                }
                              >
                                <Link
                                  to={`/admin/users/${user.id}/edit`}
                                  onClick={() =>
                                    setOpenMenu(null)
                                  }
                                >
                                  <Edit3 size={15} />
                                  Edit user
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleStatus(user)
                                  }
                                  disabled={statusLoading}
                                >
                                  <ShieldCheck size={15} />
                                  {getStatus(user) === "active"
                                    ? "Deactivate"
                                    : "Activate"}
                                </button>

                                <button
                                  type="button"
                                  className="danger"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setOpenMenu(null);
                                  }}
                                >
                                  <Trash2 size={15} />
                                  Delete user
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="admin-users-pagination">

                <span>
                  Showing{" "}
                  <strong>{startItem}</strong>
                  {"–"}
                  <strong>{endItem}</strong>
                  {" of "}
                  <strong>{totalUsers}</strong>
                </span>

                <div>
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1),
                      )
                    }
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="admin-users-page-number">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(totalPages, current + 1),
                      )
                    }
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

              </div>
            </>
          )}
        </section>

      </div>

      {/* DELETE MODAL */}
      {selectedUser && (
        <div
          className="admin-users-modal-backdrop"
          onClick={() => {
            if (!deleteLoading) {
              setSelectedUser(null);
            }
          }}
        >
          <div
            className="admin-users-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-users-modal-icon danger">
              <Trash2 size={22} />
            </div>

            <h2>Delete user?</h2>

            <p>
              You are about to permanently delete{" "}
              <strong>
                {getDisplayName(selectedUser)}
              </strong>
              . This action cannot be undone.
            </p>

            <div className="admin-users-modal-actions">
              <button
                type="button"
                className="secondary"
                disabled={deleteLoading}
                onClick={() =>
                  setSelectedUser(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="danger"
                disabled={deleteLoading}
                onClick={handleDelete}
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw
                      size={15}
                      className="admin-users-refresh-spinning"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Delete user
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminUsers;