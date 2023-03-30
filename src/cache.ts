import LRUCache from "lru-cache";
const options = {
  max: 5000,
  ttl: 86400000,
};

const cache = new LRUCache(options);
export const Cache = cache;
