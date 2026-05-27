import crypto from "crypto";

// ────────────────────────────────────────────────────────────
// Telebirr H5 C2B Web Payment Utilities
// Docs: https://developer.ethiotelecom.et/
// ────────────────────────────────────────────────────────────

const TELEBIRR_API_BASE = process.env.TELEBIRR_API_BASE || "https://developer.ethiotelecom.et/v1";
const FABRIC_APP_ID = process.env.TELEBIRR_FABRIC_APP_ID || "";
const APP_SECRET = process.env.TELEBIRR_APP_SECRET || "";
const MERCHANT_APP_ID = process.env.TELEBIRR_MERCHANT_APP_ID || "";
const MERCHANT_CODE = process.env.TELEBIRR_MERCHANT_CODE || "";
const PUBLIC_KEY = process.env.TELEBIRR_PUBLIC_KEY || "";

/** Generate a unique order/nonce string */
export function generateNonce(len = 32): string {
  return crypto.randomBytes(len).toString("hex").slice(0, len);
}

/** Get current timestamp in the format Telebirr expects */
export function getTimestamp(): string {
  return new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
}

/** SHA256 sign a string */
export function sha256(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

/** RSA encrypt using Telebirr's public key */
export function rsaEncrypt(data: string): string {
  if (!PUBLIC_KEY) return data;
  const buffer = Buffer.from(data, "utf8");
  const encrypted = crypto.publicEncrypt(
    {
      key: `-----BEGIN PUBLIC KEY-----\n${PUBLIC_KEY}\n-----END PUBLIC KEY-----`,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer
  );
  return encrypted.toString("base64");
}

/**
 * Step 1: Apply for a Fabric Token
 */
export async function createFabricToken(): Promise<string> {
  const res = await fetch(`${TELEBIRR_API_BASE}/merchant/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appSecret: APP_SECRET }),
  });

  if (!res.ok) {
    throw new Error(`Fabric token request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.token || data.access_token || "";
}

export interface CreateOrderParams {
  amount: string;
  cardNumber: string;
  cardholderName: string;
  notifyUrl: string;
  returnUrl: string;
}

/**
 * Step 2: Create a prepaid order and get checkout URL
 */
export async function createOrder(params: CreateOrderParams): Promise<{ checkoutUrl: string; orderNo: string }> {
  const { amount, cardNumber, cardholderName, notifyUrl, returnUrl } = params;

  const timestamp = getTimestamp();
  const nonce = generateNonce();
  const outTradeNo = `TF-${Date.now()}-${nonce.slice(0, 8)}`;

  // Build the order payload per Telebirr spec
  const orderPayload = {
    appId: MERCHANT_APP_ID,
    merch_code: MERCHANT_CODE,
    nonce,
    notifyUrl,
    outTradeNo,
    receiveName: "TransitFlow",
    returnUrl,
    shortCode: MERCHANT_CODE,
    subject: `RFID Card Recharge - ${cardNumber}`,
    timeoutExpress: "30",
    timestamp,
    totalAmount: amount,
    tradeType: "Checkout",
  };

  // Sign the payload: sort keys alphabetically, concat values, SHA256
  const signString = Object.keys(orderPayload)
    .sort()
    .map((k) => `${k}=${orderPayload[k as keyof typeof orderPayload]}`)
    .join("&");
  const sign = sha256(signString);

  // Encrypt payload with RSA public key
  const ussdJson = JSON.stringify({ ...orderPayload, sign });
  const encryptedPayload = rsaEncrypt(ussdJson);

  // Get fabric token
  const token = await createFabricToken();

  // Call Telebirr create order API
  const res = await fetch(`${TELEBIRR_API_BASE}/merchant/preOrder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      appid: FABRIC_APP_ID,
      sign: encryptedPayload,
    }),
  });

  if (!res.ok) {
    throw new Error(`Telebirr order creation failed: ${res.status}`);
  }

  const data = await res.json();

  return {
    checkoutUrl: data.data?.toPayUrl || data.toPayUrl || "",
    orderNo: outTradeNo,
  };
}

/**
 * Step 3: Verify callback signature from Telebirr webhook
 */
export function verifyCallback(payload: Record<string, string>): boolean {
  const { sign, ...rest } = payload;
  if (!sign) return false;

  const signString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("&");
  const computed = sha256(signString);

  return computed === sign;
}
