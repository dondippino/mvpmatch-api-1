import LRUCache from "lru-cache";
import { TOKEN_EXPIRY_IN_HOURS } from "./utils";
const options = {
  max: 5000,
  ttl: 3600000 * TOKEN_EXPIRY_IN_HOURS,
};

const liveSessionCache = new LRUCache<string, { iat: number }>(options);
const loggedOutSessionCache = new LRUCache<string, number>(options);
export const Cache = { liveSessionCache, loggedOutSessionCache };
