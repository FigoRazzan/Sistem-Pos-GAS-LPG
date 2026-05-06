import midtransClient from "midtrans-client";

const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});

const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey,
  clientKey,
});

export function getMidtransConfig() {
  return { serverKey, clientKey, isProduction };
}

export function getCoreApi() {
  return coreApi;
}

export async function createSnapTransaction(params: {
  orderId: string;
  grossAmount: number;
  itemName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}) {
  if (!serverKey || !clientKey) {
    throw new Error("MIDTRANS_KEY_MISSING");
  }

  return snap.createTransaction({
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.grossAmount,
    },
    item_details: [
      {
        id: params.orderId,
        price: params.grossAmount,
        quantity: 1,
        name: params.itemName,
      },
    ],
    customer_details: {
      first_name: params.customerName,
      email: params.customerEmail,
      phone: params.customerPhone,
    },
  });
}

export async function getMidtransStatus(orderId: string) {
  if (!serverKey || !clientKey) {
    throw new Error("MIDTRANS_KEY_MISSING");
  }

  return coreApi.transaction.status(orderId);
}
