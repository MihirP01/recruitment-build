const databaseUrl = process.env.DATABASE_URL?.trim();
const databaseDirectUrl = process.env.DATABASE_URL_UNPOOLED?.trim();

export const HAS_DATABASE = Boolean(databaseUrl);
export const HAS_DIRECT_DATABASE = Boolean(databaseDirectUrl);
export const PORTAL_DATA_SOURCE = HAS_DATABASE ? "database" : "csv-dev";
