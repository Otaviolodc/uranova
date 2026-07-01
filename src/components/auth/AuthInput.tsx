interface AuthInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-300">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          h-12
          w-full
          rounded-xl
          border
          border-zinc-800
          bg-zinc-900
          px-4
          text-white
          placeholder:text-zinc-500
          outline-none
          transition

          focus:border-green-500
          focus:ring-2
          focus:ring-green-500/20
        "
      />
    </div>
  );
}