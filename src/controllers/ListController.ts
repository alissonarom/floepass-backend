// src/backend/controllers/ListController.ts
import { Request, Response } from "express";
import List from "../models/List";

export default {
  // Listar todas as listas
  async index(req: Request, res: Response) {
    try {
      const lists = await List.aggregate([
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner"
          }
        },
        { $unwind: "$owner" },
        {
          $lookup: {
            from: "events",  // Novo lookup para o eventId
            localField: "eventId",
            foreignField: "_id",
            as: "event"
          }
        },
        {
          $lookup: {
            from: "histories",
            localField: "historico",
            foreignField: "_id",
            as: "historico"
          }
        },
        { $unwind: { path: "$historico", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            localField: "historico.users.id",
            foreignField: "_id",
            as: "historico.usersWithData"
          }
        },
        {
          $addFields: {
            "historico.users": {
              $map: {
                input: "$historico.users",
                as: "user",
                in: {
                  $mergeObjects: [
                    "$$user",
                    {
                      id: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$historico.usersWithData",
                              as: "userData",
                              cond: { $eq: ["$$userData._id", "$$user.id"] }
                            }
                          },
                          0
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $project: {
            title: 1,
            owner: 1,
            startDate: 1,
            endDate: 1,
            isExam: 1,
            domain: 1,
            eventId: 1,
            event: { $ifNull: ["$event", null] }, // Mantém o event mesmo se for null
            historico: { $ifNull: ["$historico", null] }, // Mantém o historico mesmo se for null
            createdAt: 1,
            updatedAt: 1
          }
        }
      ]);

      return res.json(lists);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar listas" });
    }
  },
//   async index(req: Request, res: Response) {
//     try {
//       const lists = await List.find()
//         .sort({ createdAt: -1 })
//         .populate("owner", "name profile cpf _id")
//         .populate("event", "title startDate domain")
//         .populate({
//           path: "historico",
//           populate: {
//             path: "users.id",
//             select: "name profile cpf _id"
//           }
//         });

//       return res.json(lists);
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: "Erro ao buscar listas" });
//     }
// },

  // Criar uma nova lista
  async create(req: Request, res: Response) {

    const listData = req.body;

    if (listData.historico === "") {
      listData.historico = null;
    }

    try {
      const lista = await List.create(listData);
      return res.status(201).json(lista);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar lista", log: error });
    }
  },

  // Editar uma lista existente
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const updateData = req.body;

    try {
      const updatedList = await List.findByIdAndUpdate(
        id,
        { $set: updateData }, // Usa $set para atualizar apenas os campos fornecidos
      { new: true } // Retorna o documento atualizado
      );

      if (!updatedList) {
      return res.status(404).json({ error: "Lista não encontrada" });
    }

      return res.json(updatedList);
    } catch (error) {
      console.error("Erro ao atualizar lista:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },
};