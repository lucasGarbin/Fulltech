export default function Field({ id, name, label, required, error, type = "text", textarea, full, value, onChange, onBlur, placeholder, maxLength, autoComplete }) {
  const common = {
    id,
    name: name ?? id,
    value,
    placeholder,
    autoComplete,
    className: error ? "invalid" : "",
    onChange: (e) => onChange(e.target.value),
    onBlur,
    "aria-invalid": error ? "true" : undefined,
    "aria-required": required ? "true" : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
  return (
    <div className={`field ${full ? "field--full" : ""}`}>
      <label htmlFor={id}>
        {label}
        {required && <span> *</span>}
      </label>
      {textarea ? <textarea {...common} /> : <input type={type} maxLength={maxLength} {...common} />}
      {error && <p className="field-error" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
}
