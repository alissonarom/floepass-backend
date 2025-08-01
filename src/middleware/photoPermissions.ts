import { Request, Response, NextFunction } from "express";

export const checkPhotoPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.auth) {
    return res.status(401).json({
      success: false,
      message: "Usuário não autenticado",
      errorCode: "NOT_AUTHENTICATED",
    });
  }

  try {
    const { userId, db } = req.auth;

    const user = await db.collection("users").findOne({
      _id: userId,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado",
        errorCode: "USER_NOT_FOUND",
      });
    }

    const allowedProfiles = ["Administrador", "Funcionário", "Mentoria"];
    if (allowedProfiles.includes(user.profile)) {
      (req as any).currentUser = user;
      next();
    } else {
      return res.status(403).json({
        success: false,
        message:
          "Permissão negada. Você não tem permissão para alterar fotos.",
        errorCode: "PERMISSION_DENIED",
        userProfile: user.profile,
      });
    }
  } catch (error) {
    console.error("Erro ao verificar permissões:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      errorCode: "INTERNAL_ERROR",
    });
  }
};
