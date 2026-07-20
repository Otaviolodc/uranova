"use server";

import { revalidatePath } from "next/cache";

import {
  approveWithdraw,
  rejectWithdraw,
  markWithdrawAsPaid,
} from "@/lib/services/adminWithdraw";

export async function approveWithdrawAction(id: string) {
  await approveWithdraw(id);

  revalidatePath("/admin/withdraws");
}

export async function rejectWithdrawAction(id: string) {
  await rejectWithdraw(id);

  revalidatePath("/admin/withdraws");
}

export async function markWithdrawAsPaidAction(id: string) {
  await markWithdrawAsPaid(id);

  revalidatePath("/admin/withdraws");
}