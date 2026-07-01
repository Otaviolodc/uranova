import Link from "next/link";

interface AuthFooterProps {
  text: string;
  linkText: string;
  href: string;
}

export default function AuthFooter({
  text,
  linkText,
  href,
}: AuthFooterProps) {
  return (
    <p className="text-center text-sm text-zinc-500">
      {text}{" "}
      <Link
        href={href}
        className="font-medium text-green-500 hover:text-green-400"
      >
        {linkText}
      </Link>
    </p>
  );
}