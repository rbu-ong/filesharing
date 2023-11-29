const rateLimit = require("express-rate-limit");

const createRateLimiter = (windowMs, maxRequests) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: "Too many requests from this IP, please try again later.",
  });
};

module.exports = createRateLimiter;
