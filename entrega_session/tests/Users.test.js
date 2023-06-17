import { UserMongo } from "../src/dao/MongoDB/models/User.js";
import mongoose from "mongoose";
import assert from "assert";
import dotenv from "dotenv";
dotenv.config();


await mongoose.connect(process.env.mongoUrl);

const assert1 = assert.strict

describe('Testing Users', function () { //Descripcion del grupo de operaciones
    before(function () {
        this.usersDao = new UserMongo()
    })

    it('Consultar todos los usuarios de mi BDD', async function () { //Descripcion de la operacion
        const resultado = await this.usersDao.getElements()
        assert1.strictEqual(Array.isArray(resultado.docs), true)
        //Ambito de ejecucion propio
    })
})