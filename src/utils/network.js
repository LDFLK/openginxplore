/**
 * Non-React utility to check the current online status
 * @returns {boolean} True if the user is online, false otherwise
 */
const network = {
  isOnline: () => navigator.onLine,
};

export default network;
