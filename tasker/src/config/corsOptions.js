const getAllowedOrigins = (value = '') =>
  value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const isOriginAllowed = (origin, allowedOrigins, isProduction) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return !isProduction && allowedOrigins.length === 0;
};

module.exports = { getAllowedOrigins, isOriginAllowed };
