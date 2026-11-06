declare namespace NodeJS {
  interface ProcessEnv {
    ORDERS_API_BASE_URL?: string;
    PAYMENT_API_BASE_URL?: string;
    NOTIFICATION_API_BASE_URL?: string;
    INVENTORY_API_BASE_URL?: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
