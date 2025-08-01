import { Request, Response } from "express";
import { ObjectId, Db } from "mongodb";
import {
  uploadToStorage,
  deleteFromStorage,
  getPublicUrl,
} from "../services/storageService";

interface CustomAuth {
  userId?: ObjectId;
  db: Db;
  clientId: string;
}

interface CustomCurrentUser {
  _id: string;
  name?: string;
  profile: string;
}

interface AuthenticatedRequest {
  auth?: CustomAuth;
  currentUser?: CustomCurrentUser;
  file?: Express.Multer.File;
  body: any;
  params: any;
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
    updatedAt?: Date;
    uploadedBy?: string;
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

    if (!userId || !cpf) {
      res.status(400).json({
        success: false,
        message: "userId e cpf são obrigatórios",
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

    const { db, clientId } = req.auth;

    const user = (await db.collection("users").findOne({
      _id: new ObjectId(userId),
      client_id: clientId,
    })) as UserDocument | null;

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
        errorCode: "USER_NOT_FOUND",
      });
      return;
    }

    if (user.cpf !== cpf) {
      res.status(400).json({
        success: false,
        message: "CPF não confere com o usuário",
        errorCode: "CPF_MISMATCH",
      });
      return;
    }

    if (user.photoPath) {
      try {
        await deleteFromStorage(user.photoPath);
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

    await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(userId), client_id: clientId },
      {
        $set: {
          photoPath: publicUrl,
          photoUpdatedAt: new Date(),
          photoUploadedBy: currentUser?.name,
          updatedAt: new Date(),
        },
      }
    );

    res.json({
      success: true,
      message: "Foto salva com sucesso!",
      data: {
        photoPath: finalFilename,
        photoUrl: publicUrl,
        uploadedAt: new Date(),
        uploadedBy: currentUser?.name || currentUser?._id || "unknown",
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

    const { db, clientId } = req.auth;

    const user = (await db.collection("users").findOne({
      _id: new ObjectId(userId),
      client_id: clientId,
    })) as UserDocument | null;

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

    await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(userId), client_id: clientId },
      {
        $unset: {
          photoPath: 1,
          photoUpdatedAt: 1,
          photoUploadedBy: 1,
        },
        $set: {
          updatedAt: new Date(),
        },
      }
    );

    res.json({
      success: true,
      message: "Foto removida com sucesso!",
      deletedBy: currentUser?.name || currentUser?._id || "unknown",
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

    const { db, clientId } = req.auth;

    const user = (await db.collection("users").findOne({
      _id: new ObjectId(userId),
      client_id: clientId,
    })) as UserDocument | null;

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

    const photoUrl = user.photoPath;
    const urlParts = user.photoPath.split("/");
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