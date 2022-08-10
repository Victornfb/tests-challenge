import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;
let token: string;

describe('Get Balance Controller', () => {

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

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'test@email.com',
        password: 'test-password'
      });

    token = response.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get balance from an user', async () => {
    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('balance');
  });

});
