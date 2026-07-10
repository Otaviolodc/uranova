import Image from "next/image";

export default function AuthLogo() {
  return (
    <div className="mb-6 flex flex-col items-center">
      <Image
        src="/logo-transparent.png"
        alt="Uranova"
        width={360}
        height={100}
        priority
      />

      <p className="mt-1 text-center text-zinc-400">
        A plataforma completa para criadores digitais.
      </p>
    </div>
  );
}