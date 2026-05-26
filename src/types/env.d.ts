declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    DATABASE_URL: string;
    NODE_ENV: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
  }
}
