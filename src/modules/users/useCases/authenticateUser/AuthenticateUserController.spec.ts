import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe('Authenticate User Controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Test User',
        email: 'test@email.com',
        password: 'test-password'
      });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate an user', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'test@email.com',
        password: 'test-password'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toEqual('test@email.com');
  });

  it('should not be able to authenticate an user with an invalid email', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'incorrect@email.com',
        password: 'test-password'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

  it('should not be able to authenticate an user with an invalid password', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'test@email.com',
        password: 'incorrect-password'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

});
