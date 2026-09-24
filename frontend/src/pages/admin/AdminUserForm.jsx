import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  UserCog,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../../config/api";
import "./AdminUserForm.css";

const ROLE_OPTIONS = [
  {
    value: "student",
    label: "Student",
    description: "Access the student portal and booking services.",
    icon: Users,
  },
  {
    value: "officer",
    label: "Officer",
    description: "Manage bookings, facilities and announcements.",
    icon: UserCog,
  },
  {
    value: "admin",
    label: "Administrator",
    description: "Full access to the Kiangini management system.",
    icon: ShieldCheck,
  },
];

const YEAR_OPTIONS = [
  { value: "", label: "Select year" },
  { value: "1", label: "Year 1" },
  { value: "2", label: "Year 2" },
  { value: "3", label: "Year 3" },
  { value: "4", label: "Year 4" },
  { value: "5", label: "Year 5" },
  { value: "6", label: "Year 6" },
];

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: "student",
  student_id: "",
  course: "",
  year_of_study: "",
  password: "",
  password_confirm: "",
  is_active: true,
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (!data) {
    return "Unable to connect to the server. Please try again.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.message) {
    return data.message;
  }

  if (typeof data === "object") {
    const messages = Object.entries(data)
      .flatMap(([field, value]) => {
        const values = Array.isArray(value) ? value : [value];

        return values.map((message) => {
          const label = field
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());

          return `${label}: ${message}`;
        });
      })
      .filter(Boolean);

    if (messages.length) {
      return messages.join(" ");
    }
  }

  return "Something went wrong. Please try again.";
};

const getUserPayload = (user) => ({
  first_name: user?.first_name || "",
  last_name: user?.last_name || "",
  email: user?.email || "",
  phone: user?.phone || "",
  role: user?.role || "student",
  student_id: user?.student_id || "",
  course: user?.course || "",
  year_of_study:
    user?.year_of_study === null ||
    user?.year_of_study === undefined
      ? ""
      : String(user.year_of_study),
  password: "",
  password_confirm: "",
  is_active: user?.is_active !== false,
});

function AdminUserForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const selectedRole = useMemo(
    () =>
      ROLE_OPTIONS.find(
        (option) => option.value === form.role,
      ) || ROLE_OPTIONS[0],
    [form.role],
  );

  const loadUser = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/auth/users/${id}/`);

      setForm(getUserPayload(response.data));
    } catch (err) {
      console.error("Failed to load user:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const handleRoleChange = (role) => {
    setForm((current) => ({
      ...current,
      role,
      student_id:
        role === "student" ? current.student_id : "",
      course: role === "student" ? current.course : "",
      year_of_study:
        role === "student"
          ? current.year_of_study
          : "",
    }));

    setError("");
  };

  const validateForm = () => {
    if (!form.first_name.trim()) {
      return "First name is required.";
    }

    if (!form.last_name.trim()) {
      return "Last name is required.";
    }

    if (!form.email.trim()) {
      return "Email address is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Enter a valid email address.";
    }

    if (!form.role) {
      return "Please select a user role.";
    }

    if (form.role === "student") {
      if (!form.student_id.trim()) {
        return "Student ID is required for student accounts.";
      }

      if (!form.course.trim()) {
        return "Course is required for student accounts.";
      }

      if (!form.year_of_study) {
        return "Year of study is required for student accounts.";
      }
    }

    /*
     * Password rules:
     * - Creating: password is required.
     * - Editing: password is optional.
     * - Whenever a password is entered, confirmation is required.
     */
    if (!isEditMode && !form.password) {
      return "Password is required when creating a user.";
    }

    if (form.password) {
      if (form.password.length < 8) {
        return "Password must contain at least 8 characters.";
      }

      if (!form.password_confirm) {
        return "Password confirmation is required.";
      }

      if (form.password !== form.password_confirm) {
        return "Passwords do not match.";
      }
    }

    /*
     * This also prevents an accidental mismatch if a
     * confirmation is entered without a password.
     */
    if (!form.password && form.password_confirm) {
      return "Enter a password before confirming it.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /*
       * Base account information.
       */
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        is_active: form.is_active,
      };

      /*
       * Student-specific information.
       */
      if (form.role === "student") {
        payload.student_id = form.student_id.trim();
        payload.course = form.course.trim();
        payload.year_of_study = Number(form.year_of_study);
      } else {
        /*
         * Clear student fields for non-student accounts.
         */
        payload.student_id = null;
        payload.course = "";
        payload.year_of_study = null;
      }

      /*
       * Password information.
       *
       * The backend expects:
       * password
       * password_confirm
       */
      if (form.password) {
        payload.password = form.password;
        payload.password_confirm = form.password_confirm;
      }

      if (isEditMode) {
        await api.patch(`/auth/users/${id}/`, payload);

        setSuccess("User account updated successfully.");

        setTimeout(() => {
          navigate("/admin/users");
        }, 700);
      } else {
        /*
         * For creation the password confirmation is mandatory.
         */
        payload.password = form.password;
        payload.password_confirm = form.password_confirm;

        await api.post("/auth/users/", payload);

        setSuccess("User account created successfully.");

        setTimeout(() => {
          navigate("/admin/users");
        }, 700);
      }
    } catch (err) {
      console.error("Failed to save user:", err);

      console.error(
        "Backend response:",
        err?.response?.data,
      );

      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-user-form">
        <div className="admin-user-form-container">
          <div className="admin-user-form-loading">
            <Loader2 size={28} />
            <span>Loading user account...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-form">
      <div className="admin-user-form-container">

        {/* HEADER */}
        <header className="admin-user-form-header">
          <div>
            <Link
              to="/admin/users"
              className="admin-user-form-back"
            >
              <ArrowLeft size={16} />
              Back to users
            </Link>

            <div className="admin-user-form-eyebrow">
              <span />
              Administration
            </div>

            <h1>
              {isEditMode
                ? "Edit user account"
                : "Create new user"}
            </h1>

            <p>
              {isEditMode
                ? "Update account information, role and access settings."
                : "Create an account for a student, officer or administrator."}
            </p>
          </div>
        </header>

        {/* ERROR */}
        {error && (
          <div className="admin-user-form-alert error">
            <div className="admin-user-form-alert-icon">
              !
            </div>

            <div>
              <strong>Unable to save account</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="admin-user-form-alert success">
            <div className="admin-user-form-alert-icon">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <strong>Success</strong>
              <span>{success}</span>
            </div>
          </div>
        )}

        <form
          className="admin-user-form-layout"
          onSubmit={handleSubmit}
        >

          {/* MAIN */}
          <div className="admin-user-form-main">

            {/* ROLE */}
            <section className="admin-user-form-card">
              <div className="admin-user-form-card-header">
                <div>
                  <span className="admin-user-form-kicker">
                    Account type
                  </span>

                  <h2>Select user role</h2>

                  <p>
                    The role determines which areas of the
                    system the user can access.
                  </p>
                </div>
              </div>

              <div className="admin-user-role-grid">
                {ROLE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active =
                    form.role === option.value;

                  return (
                    <button
                      type="button"
                      key={option.value}
                      className={`admin-user-role-option ${
                        active ? "active" : ""
                      }`}
                      onClick={() =>
                        handleRoleChange(option.value)
                      }
                    >
                      <div className="admin-user-role-option-icon">
                        <Icon size={20} />
                      </div>

                      <div>
                        <strong>{option.label}</strong>
                        <span>{option.description}</span>
                      </div>

                      <span className="admin-user-role-radio">
                        {active && <i />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* PERSONAL INFORMATION */}
            <section className="admin-user-form-card">
              <div className="admin-user-form-card-header">
                <div>
                  <span className="admin-user-form-kicker">
                    Profile
                  </span>

                  <h2>Personal information</h2>

                  <p>
                    Basic information associated with the
                    account.
                  </p>
                </div>
              </div>

              <div className="admin-user-form-grid">

                {/* FIRST NAME */}
                <div className="admin-user-field">
                  <label htmlFor="first_name">
                    First name
                  </label>

                  <div className="admin-user-input">
                    <User size={17} />

                    <input
                      id="first_name"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      placeholder="e.g. Meshack"
                      autoComplete="given-name"
                    />
                  </div>
                </div>

                {/* LAST NAME */}
                <div className="admin-user-field">
                  <label htmlFor="last_name">
                    Last name
                  </label>

                  <div className="admin-user-input">
                    <User size={17} />

                    <input
                      id="last_name"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      placeholder="e.g. Musembi"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div className="admin-user-field">
                  <label htmlFor="email">
                    Email address
                  </label>

                  <div className="admin-user-input">
                    <Mail size={17} />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div className="admin-user-field">
                  <label htmlFor="phone">
                    Phone number
                  </label>

                  <div className="admin-user-input">
                    <Phone size={17} />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+254 7XX XXX XXX"
                      autoComplete="tel"
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* STUDENT INFORMATION */}
            {form.role === "student" && (
              <section className="admin-user-form-card">
                <div className="admin-user-form-card-header">
                  <div>
                    <span className="admin-user-form-kicker">
                      Student profile
                    </span>

                    <h2>Academic information</h2>

                    <p>
                      Student details used for bookings and
                      identification.
                    </p>
                  </div>
                </div>

                <div className="admin-user-form-grid">

                  {/* STUDENT ID */}
                  <div className="admin-user-field">
                    <label htmlFor="student_id">
                      Student ID
                    </label>

                    <div className="admin-user-input">
                      <Users size={17} />

                      <input
                        id="student_id"
                        name="student_id"
                        value={form.student_id}
                        onChange={handleChange}
                        placeholder="e.g. TTU/IT/001/2024"
                      />
                    </div>
                  </div>

                  {/* YEAR */}
                  <div className="admin-user-field">
                    <label htmlFor="year_of_study">
                      Year of study
                    </label>

                    <select
                      id="year_of_study"
                      name="year_of_study"
                      value={form.year_of_study}
                      onChange={handleChange}
                    >
                      {YEAR_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* COURSE */}
                  <div className="admin-user-field full">
                    <label htmlFor="course">
                      Course / Programme
                    </label>

                    <div className="admin-user-input">
                      <UserCog size={17} />

                      <input
                        id="course"
                        name="course"
                        value={form.course}
                        onChange={handleChange}
                        placeholder="e.g. Bachelor of Science in Information Technology"
                      />
                    </div>
                  </div>

                </div>
              </section>
            )}

            {/* SECURITY */}
            <section className="admin-user-form-card">
              <div className="admin-user-form-card-header">
                <div>
                  <span className="admin-user-form-kicker">
                    Security
                  </span>

                  <h2>Password & access</h2>

                  <p>
                    {isEditMode
                      ? "Leave the password fields empty to keep the current password."
                      : "Set a secure password for the new account."}
                  </p>
                </div>
              </div>

              <div className="admin-user-form-grid">

                {/* PASSWORD */}
                <div className="admin-user-field">
                  <label htmlFor="password">
                    {isEditMode
                      ? "New password"
                      : "Password"}
                  </label>

                  <div className="admin-user-input">
                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current,
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                {/* PASSWORD CONFIRMATION */}
                <div className="admin-user-field">
                  <label htmlFor="password_confirm">
                    Confirm password
                  </label>

                  <div className="admin-user-input">
                    <input
                      id="password_confirm"
                      name="password_confirm"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={form.password_confirm}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current,
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

              </div>

              <div className="admin-user-password-hint">
                <ShieldCheck size={16} />

                <span>
                  Use a strong password with at least
                  8 characters.
                </span>
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="admin-user-form-sidebar">

            {/* ACCOUNT PREVIEW */}
            <div className="admin-user-preview-card">
              <span className="admin-user-preview-kicker">
                Account preview
              </span>

              <div
                className={`admin-user-preview-avatar ${form.role}`}
              >
                {form.first_name?.charAt(0) ||
                  form.email?.charAt(0) ||
                  "U"}

                {form.last_name?.charAt(0) || ""}
              </div>

              <h3>
                {`${form.first_name} ${form.last_name}`.trim() ||
                  "New user"}
              </h3>

              <span className="admin-user-preview-email">
                {form.email || "email@example.com"}
              </span>

              <span
                className={`admin-user-preview-role ${form.role}`}
              >
                {selectedRole.label}
              </span>

              <div className="admin-user-preview-divider" />

              {/* STATUS */}
              <div className="admin-user-preview-row">
                <span>Status</span>

                <strong
                  className={
                    form.is_active
                      ? "active"
                      : "inactive"
                  }
                >
                  <i />

                  {form.is_active
                    ? "Active"
                    : "Inactive"}
                </strong>
              </div>

              {/* STUDENT DETAILS */}
              {form.role === "student" && (
                <>
                  <div className="admin-user-preview-row">
                    <span>Student ID</span>

                    <strong>
                      {form.student_id || "Not set"}
                    </strong>
                  </div>

                  <div className="admin-user-preview-row">
                    <span>Year</span>

                    <strong>
                      {form.year_of_study
                        ? `Year ${form.year_of_study}`
                        : "Not set"}
                    </strong>
                  </div>
                </>
              )}
            </div>

            {/* ROLE ACCESS */}
            <div className="admin-user-access-card">
              <div className="admin-user-access-icon">
                <ShieldCheck size={18} />
              </div>

              <div>
                <strong>
                  {selectedRole.label} access
                </strong>

                <p>{selectedRole.description}</p>
              </div>
            </div>

            {/* ACCOUNT STATUS */}
            <div className="admin-user-status-card">
              <div>
                <strong>Account status</strong>

                <span>
                  Control whether this user can sign in.
                </span>
              </div>

              <label className="admin-user-switch">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />

                <span />
              </label>
            </div>

            {/* ACTIONS */}
            <div className="admin-user-form-actions">
              <Link
                to="/admin/users"
                className="admin-user-cancel"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="admin-user-save"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="admin-user-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />

                    {isEditMode
                      ? "Save changes"
                      : "Create user"}
                  </>
                )}
              </button>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

export default AdminUserForm;