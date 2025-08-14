import { Prisma, PrismaClient, User } from "@prisma/client";
import { prisma } from "../utils/prisma";

type SafeUser = Omit<User, "password"> & { password?: never };

function sanitize(user: User | null): SafeUser | null {
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user as any;
  return rest as SafeUser;
}

// Criar ou atualizar usuário (PostgreSQL via Prisma)
export const createOrUpdateUser = async (
  userData: Partial<User> & { client_id?: string },
  clientId: string
): Promise<SafeUser> => {
  const { id, cpf, penalties, ...rest } = userData as any;

  if (!clientId) throw new Error("client_id é obrigatório");

  const cpfVal: string | null =
    typeof cpf === "string" && cpf.trim() !== "" ? cpf : null;
  const baseData: Prisma.UserUncheckedCreateInput = {
    id: (id as string) ?? undefined,
    client_id: clientId,
    cpf: cpfVal ?? undefined,
    name: rest.name ?? "",
    birthDate: rest.birthDate ? new Date(rest.birthDate) : null,
    phone: rest.phone ?? null,
    gender: rest.gender ?? "N/A",
    profile: rest.profile ?? "Usuário",
    anniversary: Boolean(rest.anniversary ?? false),
    currentLists: rest.currentLists ?? null,
    cash: Number(rest.cash ?? 0),
    password: rest.password ?? null,
    registrationDay: rest.registrationDay
      ? new Date(rest.registrationDay)
      : new Date(),
    photoPath: rest.photoPath ?? null,
    photoUpdatedAt: rest.photoUpdatedAt ? new Date(rest.photoUpdatedAt) : null,
    photoUploadedBy: rest.photoUploadedBy ?? null,
    penalties: Array.isArray(penalties) ? penalties : penalties ?? null,
  };

  let saved: User;
  if (cpfVal) {
    saved = await prisma.user.upsert({
      where: { client_id_cpf: { client_id: clientId, cpf: cpfVal } },
      update: { ...baseData },
      create: { ...baseData, id: baseData.id ?? undefined },
    });
  } else if (id) {
    saved = await prisma.user.upsert({
      where: { id: id as string },
      update: { ...baseData },
      create: { ...baseData, id: id as string },
    });
  } else {
    saved = await prisma.user.create({ data: baseData });
  }

  return sanitize(saved)!;
};

// Listar todos os usuários do tenant específico
export const getAllUsers = async (clientId: string): Promise<SafeUser[]> => {
  const users = await prisma.user.findMany({ where: { client_id: clientId } });
  return users.map((u) => sanitize(u)!) as SafeUser[];
};

// Buscar usuário por ID (com verificação de tenant)
export const getUserById = async (
  userId: string,
  clientId: string
): Promise<SafeUser | null> => {
  const user = await prisma.user.findFirst({
    where: { id: userId, client_id: clientId },
  });
  return sanitize(user);
};

// Buscar usuário por CPF (com verificação de tenant)
export const getUserByCpf = async (
  cpf: string,
  clientId: string
): Promise<SafeUser | null> => {
  const user = await prisma.user.findFirst({
    where: { cpf, client_id: clientId },
  });
  return sanitize(user);
};

// Adicionar penalidade a um usuário (com verificação de tenant)
export const addPenaltyToUser = async (
  cpf: string,
  penaltyData: any,
  clientId: string
): Promise<SafeUser> => {
  const existing = await prisma.user.findFirst({
    where: { cpf, client_id: clientId },
  });
  if (!existing) throw new Error("Usuário não encontrado");
  const penalties = Array.isArray(existing.penalties)
    ? existing.penalties
    : existing.penalties
    ? [existing.penalties]
    : [];
  const updated = await prisma.user.update({
    where: existing.cpf
      ? { client_id_cpf: { client_id: clientId, cpf: existing.cpf } }
      : { id: existing.id },
    data: { penalties: [...penalties, penaltyData] },
  });
  return sanitize(updated)!;
};

// Atualizar parcialmente um usuário
export const updateUserPartial = async (
  userId: string,
  clientId: string,
  updateData: Partial<User>
): Promise<SafeUser> => {
  const user = await prisma.user.findFirst({
    where: { id: userId, client_id: clientId },
  });
  if (!user) throw new Error("Usuário não encontrado");
  const { penalties, ...rest } = updateData as any;
  const data: any = { ...rest };
  if (penalties !== undefined) {
    data.penalties = penalties as any;
  }
  const updated = await prisma.user.update({ where: { id: userId }, data });
  return sanitize(updated)!;
};
