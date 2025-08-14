// src/backend/multiTenancy.ts
// Deprecated Mongo multi-tenancy util. Postgres/Prisma is now the source of truth.
// We keep a stub that compiles but throws at runtime if called.
export function getModelForTenant(..._args: any[]): any {
  throw new Error(
    "Mongo multiTenancy util não é mais suportado. Migre para Prisma/Postgres."
  );
}
