const { execSync } = require('child_process');
const uriOriginal = process.env.MONGO_URI;
const novoDB = 'client_greyMist';

// Dump para arquivo temporário
execSync(`mongodump --uri="${uriOriginal}" --archive=./tmp.dump`);

// Restaura no novo DB
execSync(`mongorestore --uri="${uriOriginal.replace('/flow-pass-db', `/${novoDB}`)}" --drop ./tmp.dump`);

console.log('Database clonado com sucesso!');