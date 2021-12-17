const { MongoClient } = require("mongodb");
let _db;

async function connect() {
    const mongoClient = new MongoClient('mongodb://' + process.env.DB_URI);

    try {
        await mongoClient.connect();
        _db = await mongoClient.db(process.env.DB_NAME);
        console.log(`Database connected sucessfully...`);
    } catch (error) {
        console.log(error);
    }
}

let UserProvider = {
    async get(filter) {
        const admin = await _db.collection(process.env.Coll_User).findOne(filter);
        return admin;

    },

    async insert(document) {

        const result = await _db.collection(process.env.Coll_User).insertOne(document);
        return result;
    },
    async count(filter, option) {
        const result = await _db.collection(process.env.Coll_User).count(filter, option);
        return result;
    }
}

const TargetProvider = {
    async get(filter) {
        const target = await _db.collection(process.env.Coll_Target).findOne(filter);
        return target;
    },
    async getAll(filter, projection) {
        const targets = await _db.collection(process.env.Coll_Target).find(filter).project(projection);
        return targets;
    },
    async insert(document) {
        const result = await _db.collection(process.env.Coll_Target).insertOne(document);
        return result;
    },
    async update(filter, option) {
        const result = await _db.collection(process.env.Coll_Target).updateOne(filter, option);
        return result;
    },

    async findandUpdate(filter, document) {
        const result = await _db.collection(process.env.Coll_Target).findOneAndUpdate(filter, document);
        return result;
    },
    async remove(filter) {
        const result = await _db.collection(process.env.Coll_Target).findOneAndDelete(filter);
        return result;
    },
    async removeCollection(collName) {
        const result = new Promise(function (resolve, reject) {
            _db.listCollections({ name: collName })
                .next(async function (err, collinfo) {
                    if (collinfo) {
                        await _db.collection(collName).drop();
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                });
        })
        return await result;
    },
    async aggregate(pipeline) {
        const result = await _db.collection(process.env.Coll_Target).aggregate(pipeline);
        return result;
    }
}

const DbProvider = {
    async clearDb() {
        const result = await _db.dropDatabase();
        return result;
    }
}


module.exports = {
    connect,
    UserProvider,
    TargetProvider,
    DbProvider
}
