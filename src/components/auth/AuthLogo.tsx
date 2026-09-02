import Image from "next/image";

export default function AuthLogo() {
  return (
    <div className="mb-1 flex justify-center">
      <Image
        src="/uranova-logo.svg"
        alt="Uranova"
        width={360}
        height={84}
        priority
      />
    </div>
  );
}