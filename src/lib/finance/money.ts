/** All arithmetic is integer cents; conversion to decimal is presentation only. */
export function cents(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error("Invalid monetary amount");
  return value;
}

export function priceToCents(value: string | number): number {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(value));
  if (!match) throw new Error("Preço inválido: use até duas casas decimais.");
  return cents(Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0")));
}

export function platformFeeCents(gross: number): number {
  cents(gross);
  return Math.floor(gross / 10) + (gross % 10 >= 5 ? 1 : 0);
}

export function directChargeAmounts(gross: number, applicationFee: number, transaction: {
  amount: number; fee: number; net: number; currency: string;
  fee_details: { amount: number; type: string; currency: string }[];
}) {
  cents(gross); cents(applicationFee); cents(transaction.fee); cents(transaction.net);
  if (gross <= 0 || transaction.currency !== "brl" || transaction.amount !== gross ||
      applicationFee !== platformFeeCents(gross) || applicationFee <= 0) {
    throw new Error("Charge amount, currency or application fee mismatch");
  }
  let app = 0, stripe = 0;
  for (const detail of transaction.fee_details) {
    cents(detail.amount);
    if (detail.currency !== "brl") throw new Error("Fee currency mismatch");
    if (detail.type === "application_fee") app += detail.amount;
    else if (detail.type === "stripe_fee" || detail.type === "tax") stripe += detail.amount;
    else throw new Error("Unsupported fee component: reconciliation required");
  }
  if (app !== applicationFee || app + stripe !== transaction.fee ||
      gross - transaction.fee !== transaction.net) {
    throw new Error("Fee breakdown unavailable or inconsistent; retry reconciliation");
  }
  return { gross, platformFee: app, stripeFee: stripe, producerNet: transaction.net };
}
