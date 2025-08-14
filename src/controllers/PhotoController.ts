import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import {
  uploadToStorage,
  deleteFromStorage,
  getPublicUrl,
} from "../services/storageService";

interface CustomAuth {
  userId?: string;
  clientId: string;
}

interface CustomCurrentUser {
  id?: string;
  name?: string;
  profile: string;
}

interface AuthenticatedRequest {
  auth?: CustomAuth;
  currentUser?: CustomCurrentUser;
  file?: Express.Multer.File;
  body: any;
  params: any;
  query?: any;
}

interface UserDocument {
  _id: string;
  name: string;
  cpf: string;
  client_id: string;
  photoPath?: string;
  photoUpdatedAt?: Date;
  photoUploadedBy?: string;
}

interface PhotoUploadResponse {
  success: boolean;
  message: string;
  data?: {
    photoPath: string;
    photoUrl: string;
    uploadedAt: Date;
    uploadedBy: string;
  };
  errorCode?: string;
}

interface PhotoDeleteResponse {
  success: boolean;
  message: string;
  deletedBy?: string;
  errorCode?: string;
}

interface PhotoGetResponse {
  success: boolean;
  data?: {
    hasPhoto: boolean;
    photoUrl: string | null;
    photoPath: string | null;
    updatedAt?: Date | null;
    uploadedBy?: string | null;
  };
  message?: string;
  errorCode?: string;
}

export const uploadPhoto = async (
  req: AuthenticatedRequest,
  res: Response<PhotoUploadResponse>
): Promise<void> => {
  try {
    const { userId, cpf } = req.body;
    const currentUser = req.currentUser;

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Nenhuma foto foi enviada",
        errorCode: "NO_FILE",
      });
      return;
    }

    if (!userId && !cpf) {
      res.status(400).json({
        success: false,
        message: "Informe userId ou cpf",
        errorCode: "MISSING_DATA",
      });
      return;
    }

    if (!req.auth) {
      res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
        errorCode: "NOT_AUTHENTICATED",
      });
      return;
    }

    const { clientId } = req.auth;

    // Resolve o usuário por id (preferencial) ou por cpf
    const norm = (v: string) => (v || "").replace(/\D/g, "");
    const providedCpf = cpf ? norm(String(cpf)) : undefined;

    let user = null as Awaited<ReturnType<typeof prisma.user.findFirst>> | null;
    if (userId) {
      user = await prisma.user.findFirst({
        where: { id: String(userId), client_id: clientId },
      });
      if (!user) {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
          errorCode: "USER_NOT_FOUND",
        });
        return;
      }
      // Se CPF foi enviado, valide
      if (providedCpf) {
        const userCpf = user.cpf ? norm(String(user.cpf)) : undefined;
        if (!userCpf || userCpf !== providedCpf) {
          res.status(400).json({
            success: false,
            message: "CPF não confere com o usuário",
            errorCode: "CPF_MISMATCH",
          });
          return;
        }
      }
    } else if (providedCpf) {
      user = await prisma.user.findFirst({
        where: { cpf: providedCpf, client_id: clientId },
      });
      if (!user) {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
          errorCode: "USER_NOT_FOUND",
        });
        return;
      }
    }

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
        errorCode: "USER_NOT_FOUND",
      });
      return;
    }

    if (user.photoPath) {
      try {
        const parts = user.photoPath.split("/");
        const prevKey = parts[parts.length - 1];
        await deleteFromStorage(prevKey);
      } catch (error) {
        console.warn(
          "Não foi possível remover foto anterior do R2:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    const timestamp = Date.now();
    const finalFilename = `user_${cpf}_${timestamp}.jpg`;

    await uploadToStorage(finalFilename, req.file.buffer, req.file.mimetype);

    const publicUrl = getPublicUrl(finalFilename);

    const targetUserId = userId ? String(userId) : String(user.id);
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        photoPath: publicUrl,
        photoUpdatedAt: new Date(),
        photoUploadedBy: currentUser?.name ?? null,
      },
    });

    res.json({
      success: true,
      message: "Foto salva com sucesso!",
      data: {
        photoPath: finalFilename,
        photoUrl: publicUrl,
        uploadedAt: new Date(),
        uploadedBy: currentUser?.name || currentUser?.id || "unknown",
      },
    });
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      errorCode: "INTERNAL_ERROR",
    });
  }
};

export const deletePhoto = async (
  req: AuthenticatedRequest,
  res: Response<PhotoDeleteResponse>
): Promise<void> => {
  try {
    const paramUserId =
      req.params?.userId ?? req.body?.userId ?? req.query?.userId;
    const cpf = req.params?.cpf ?? req.body?.cpf ?? req.query?.cpf;
    const currentUser = req.currentUser;

    if (!paramUserId && !cpf) {
      res.status(400).json({
        success: false,
        message: "Informe userId ou cpf",
        errorCode: "MISSING_IDENTIFIER",
      });
      return;
    }

    if (!req.auth) {
      res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
        errorCode: "NOT_AUTHENTICATED",
      });
      return;
    }

    const { clientId } = req.auth;

    // Resolve o usuário por id (preferencial) ou cpf
    const norm = (v: string) => (v || "").replace(/\D/g, "");
    const providedCpf = cpf ? norm(String(cpf)) : undefined;

    let user = null as Awaited<ReturnType<typeof prisma.user.findFirst>> | null;
    if (paramUserId) {
      user = await prisma.user.findFirst({
        where: { id: String(paramUserId), client_id: clientId },
      });
      if (!user) {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
          errorCode: "USER_NOT_FOUND",
        });
        return;
      }
      if (providedCpf) {
        const userCpf = user.cpf ? norm(String(user.cpf)) : undefined;
        if (!userCpf || userCpf !== providedCpf) {
          res.status(400).json({
            success: false,
            message: "CPF não confere com o usuário",
            errorCode: "CPF_MISMATCH",
          });
          return;
        }
      }
    } else if (providedCpf) {
      user = await prisma.user.findFirst({
        where: { cpf: providedCpf, client_id: clientId },
      });
      if (!user) {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
          errorCode: "USER_NOT_FOUND",
        });
        return;
      }
    }

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
        errorCode: "USER_NOT_FOUND",
      });
      return;
    }

    if (!user.photoPath) {
      res.status(400).json({
        success: false,
        message: "Usuário não possui foto para remover",
        errorCode: "NO_PHOTO_TO_DELETE",
      });
      return;
    }

    const urlParts = user.photoPath.split("/");
    const objectKey = urlParts[urlParts.length - 1];

    try {
      await deleteFromStorage(objectKey);
    } catch (error) {
      console.error("Erro ao remover arquivo do R2:", error);
    }

    const targetUserId = paramUserId ? String(paramUserId) : String(user.id);
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        photoPath: null,
        photoUpdatedAt: null,
        photoUploadedBy: null,
      },
    });

    res.json({
      success: true,
      message: "Foto removida com sucesso!",
      deletedBy: currentUser?.name || currentUser?.id || "unknown",
    });
  } catch (error) {
    console.error("Erro ao remover foto:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      errorCode: "INTERNAL_ERROR",
    });
  }
};

export const getUserPhoto = async (
  req: AuthenticatedRequest,
  res: Response<PhotoGetResponse>
): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUser = req.currentUser;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "userId é obrigatório",
        errorCode: "MISSING_USER_ID",
      });
      return;
    }

    if (!req.auth) {
      res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
        errorCode: "NOT_AUTHENTICATED",
      });
      return;
    }

    const { clientId } = req.auth;

    const user = await prisma.user.findFirst({
      where: { id: String(userId), client_id: clientId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
        errorCode: "USER_NOT_FOUND",
      });
      return;
    }

    if (!user.photoPath) {
      const response: PhotoGetResponse = {
        success: true,
        data: {
          hasPhoto: false,
          photoUrl: null,
          photoPath: null,
        },
      };
      res.json(response);
      return;
    }

    const photoUrl = user.photoPath!;
    const urlParts = user.photoPath!.split("/");
    const objectKey = urlParts[urlParts.length - 1];

    const responseData = {
      hasPhoto: true,
      photoUrl: photoUrl,
      photoPath: objectKey,
      updatedAt: user.photoUpdatedAt,
      uploadedBy: user.photoUploadedBy,
    };

    const response: PhotoGetResponse = {
      success: true,
      data: responseData,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      errorCode: "INTERNAL_ERROR",
    });
  }
};
