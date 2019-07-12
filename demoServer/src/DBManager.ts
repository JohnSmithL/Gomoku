import Singleton from "./Singleton";
import { MongoClient, MongoError, Db, Collection } from "mongodb";


export default class DBManager extends Singleton<DBManager>{


    db: Db;
    userCollection: Collection;

    connectDB() {
        let dbUrl = "mongodb://localhost:27017";

        MongoClient.connect(dbUrl, (error: MongoError, db: MongoClient) => {
            if (error) {
                console.log("Error!", error);
                return;
            }
            console.log("connected");

            this.db = db.db("cocos");
            this.userCollection = this.db.collection("user");

        });
    }

    static getDb():Db{
        return DBManager.getInstance(DBManager).db;
    }

    static getUserCollection():Collection{
        return DBManager.getInstance(DBManager).userCollection;
    }
}