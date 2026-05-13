export const OFFLINE_ERROR = "OFFLINE_NETWORK_ERROR";

const network = {
  isOnline: () => navigator.onLine,
};

export default network;
