import chai from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


const expect = chai.expect;
const api = supertest('http://localhost:3000');

// Connect to MongoDB
before(async () => {
    await mongoose.connect(process.env.mongoUrl);
  });
  
  // Close MongoDB connection after tests
  after(async () => {
    await mongoose.disconnect();
  });
  
  describe('POST /auth/signup', function () {
    it('should create a new user', async function () {
      const user = {
        first_name: 'Johnny',
        last_name: 'Test',
        email: 'jtest@jtest.com',
        password: 'jtest@jtest.com',
        age: 28,
        isadmin: 0,
      };
      const res = await api.post('/auth/signup').send(user);
      expect(res.statusCode).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.message).to.equal('User successfully created');
    });
  });
