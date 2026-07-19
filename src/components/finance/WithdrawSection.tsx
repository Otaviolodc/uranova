"use client";

import { useState } from "react";
import WithdrawButton from "./WithdrawButton";
import WithdrawModal from "./WithdrawModal";

interface WithdrawSectionProps {
  userId: string;
}

export default function WithdrawSection({
  userId,
}: WithdrawSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <WithdrawButton
        onClick={() => setOpen(true)}
      />

      <WithdrawModal
        open={open}
        onClose={() => setOpen(false)}
        userId={userId}
      />
    </>
  );
}