import Image from "next/image";

export default function AuthLogo() {
  return (
    <div className="mb-1 flex justify-center">
      <Image
        src="/logo-new.png"
        alt="Uranova"
        width={360}
        height={100}
        priority
      />
    </div>
  );
}