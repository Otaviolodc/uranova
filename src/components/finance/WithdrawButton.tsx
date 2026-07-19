"use client";

interface WithdrawButtonProps {
  onClick: () => void;
}

export default function WithdrawButton({
  onClick,
}: WithdrawButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        bg-green-600
        hover:bg-green-500
        transition
        px-6
        py-3
        rounded-xl
        text-white
        font-semibold
      "
    >
      💰 Solicitar saque
    </button>
  );
}