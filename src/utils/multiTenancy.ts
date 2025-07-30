// src/backend/multiTenancy.ts
import { Connection, createConnection, Model } from 'mongoose';
import { CUSTOMER_DBS } from '../app';
import IList from '../models/List'; // Importe todos os schemas necessários
import IUser from '../models/User';
import IEvent from '../models/Event';
import IHistory from '../models/History';

const connections: { [key: string]: Connection } = {};
const models: { [key: string]: { [modelName: string]: Model<any> } } = {};

export function getModelForTenant(clientId: string, modelName: string): Model<any> {
  const dbName = CUSTOMER_DBS[clientId];
  if (!dbName) {
    throw new Error(`Cliente ${clientId} não configurado`);
  }

  // Inicializa a conexão se não existir
  if (!connections[clientId]) {
    connections[clientId] = createConnection(process.env.MONGO_URI!, {
      dbName,
      maxPoolSize: 50
    });

    // Registra todos os modelos para esta conexão
    models[clientId] = {
      List: connections[clientId].model('List', IList.schema),
      User: connections[clientId].model('User', IUser.schema),
      Event: connections[clientId].model('Event', IEvent.schema),
      History: connections[clientId].model('History', IHistory.schema)
    };
  }

  // Retorna o modelo solicitado
  const model = models[clientId][modelName];
  if (!model) {
    throw new Error(`Modelo ${modelName} não registrado para o tenant ${clientId}`);
  }

  return model;
}