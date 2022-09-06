const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const f = require('util').format;



module.exports = async (conf) => {
    try {
        let options = {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            // poolSize: 15,
            // reconnectInterval: 5000
        }
        let url = `mongodb://${conf.host}`;
        if (true && !!conf.pw) {

            const user = encodeURIComponent(conf.un);
            const password = encodeURIComponent(conf.pw);
            const authMechanism = 'SCRAM-SHA-1';

            url = f('mongodb://%s:%s@%s/?authMechanism=%s&authSource=admin',
                user, password, conf.host, authMechanism
            )
        }
        if (conf.mongoClientOptions && conf.mongoClientOptions.replicaSet) {
            url += '&replicaSet=' + conf.mongoClientOptions.replicaSet
        }
        console.log('[url]: ', url);
        let client = await MongoClient.connect(url, options);
        console.log('[conf.dbName]: ', conf.dbName);
        const db = client.db(conf.dbName);
        db.close = () => {
            return db.close();
        }
        db.getCollection = async (collName) => {
            db[collName] = await db.collection(collName)
        }
        global.getDb = () => db
        return db;
    } catch (error) {
        console.error(error.stack);
        let printableConf = conf;
        delete printableConf.pw;
        console.error('Mongodb cannot connect to: ', printableConf);
        // throw error;
    }
}