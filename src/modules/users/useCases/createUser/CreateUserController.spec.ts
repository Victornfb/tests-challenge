import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe('Create User Controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Test User',
        email: 'test@email.com',
        password: 'test-password'
      });

    expect(response.status).toBe(201);
  });

  it('should not be able to create a user with an used email', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Test User 1',
        email: 'test@email.com',
        password: 'test-password-1'
      });

    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Test User 2',
        email: 'test@email.com',
        password: 'test-password-2'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

});
