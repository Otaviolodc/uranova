import Image from "next/image";

export default function AuthLogo() {
  return (
    <div className="mb-4 flex flex-col items-center">
      <Image
        src="/logo-transparent.png"
        alt="Uranova"
        width={360}
        height={100}
        priority
      />
    </div>
  );
}