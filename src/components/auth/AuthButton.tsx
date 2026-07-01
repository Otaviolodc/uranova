interface AuthButtonProps {
  children: React.ReactNode;
  loading?: boolean;
}

export default function AuthButton({
  children,
  loading,
}: AuthButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="
        h-12
        w-full
        rounded-xl
        bg-green-500
        font-semibold
        text-black

        transition-all

        hover:bg-green-400

        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {loading ? "Carregando..." : children}
    </button>
  );
}