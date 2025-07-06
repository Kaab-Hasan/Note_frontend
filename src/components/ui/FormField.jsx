function FormField({
  label,
  type = 'text',
  id,
  placeholder,
  value,
  onChange,
  error,
  required = false,
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="form-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`form-input ${error ? 'border-red-500' : ''}`}
        required={required}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export default FormField; 