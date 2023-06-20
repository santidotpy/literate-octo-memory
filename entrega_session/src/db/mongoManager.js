import { mongoose } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export class mongoManager {
  #url; // private property
  constructor(url, collection, schema) {
    this.#url = url;
    this.collection = collection;
    this.schema = new mongoose.Schema(schema);
    this.schema.plugin(mongoosePaginate);
    this.model = mongoose.model(collection, this.schema);
  }

  async connect() {
    try {
      await mongoose.connect(this.#url);
      console.log("✅ Database connected");
    } catch (error) {
      console.log("Something went wrong during connection", error);
    }
  }

  async disconnect() {
      try {
          await mongoose.disconnect();
          console.log("MongoDB disconnected");
      } catch (error) {
          console.log('Something went wrong during disconnection', error);
      }
  }

  // async getElements() {
  //   this.#connect();
  //   try {
  //     // lean() retorna un objeto plano,
  //     // esto ayuda a vizualizarlo mas facilmente con handlebars
  //     return await this.model.find().lean();
  //   } catch (error) {
  //     console.log("Something went wrong ", error);
  //   }
  // }

  async getElements(page = 1, limit = 8, sort = "asc") {
    this.connect();
    const sortDirection = sort === "desc" ? -1 : 1;
    const options = {
      page,
      limit,
      lean: true,
      sort: { price: sortDirection },
    };
    try {
      const elements = await this.model.paginate({}, options);
      elements.status = 200;
      return elements;
      //return await this.model.paginate({}, options);
    } catch (error) {
      console.log("Something went wrong ", error);
    }
  }

  async getElementById(id) {
    this.connect();
    try {
      return await this.model.findById(id).lean(); // lean() retorna un objeto plano
    } catch (error) {
      console.log(`Something went wrong with element ${id}`, error);
    }
  }

  // async addElement(data) {
  // try {
  //     return await this.model.insertOne(data);
  // } catch (error) {
  //     console.log(`Something went wrong adding element`, error);
  // }
  // }

  // agrego 1 o varios elementos
  async addElements(data) {
    this.connect();
    try {
      return await this.model.insertMany(data);
    } catch (error) {
      console.log(`Something went wrong adding elements`, error);
    }
  }

  async updateElement(id, data) {
    this.connect();
    try {
      return await this.model.findByIdAndUpdate(id, data);
    } catch (error) {
      console.log(`Something went wrong updating element ${id}`, error);
    }
  }

  async deleteElement(id) {
    this.connect();
    try {
      return await this.model.findByIdAndRemove(id);
    } catch (error) {
      console.log(`Something went wrong deleting element ${id}`, error);
    }
  }
}
