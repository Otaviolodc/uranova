export const ASAAS_URL =
  process.env.ASAAS_API_URL!;

export const ASAAS_API_KEY =
  process.env.ASAAS_API_KEY!;

export function getAsaasHeaders() {
  return {
    accept: "application/json",
    "content-type": "application/json",
    access_token: ASAAS_API_KEY,
  };
}