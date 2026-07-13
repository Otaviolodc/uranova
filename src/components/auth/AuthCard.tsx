interface AuthCardProps {
  children: React.ReactNode;
}

export default function AuthCard({
  children,
}: AuthCardProps) {
  return (
    <div
      className="
        w-full
        max-w-lg
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-950
        px-12
        pt-8
        pb-12
        shadow-[0_0_50px_rgba(0,0,0,.45)]
      "
    >
      {children}
    </div>
  );
}