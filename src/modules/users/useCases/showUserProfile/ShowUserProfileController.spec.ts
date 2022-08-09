import { Connection, createConnection } from "typeorm";
import request, { Request } from "supertest";
import { app } from "../../../../app";
import { Response } from "express";

let connection: Connection;

describe('Show User Profile Controller', () => {

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

  it('should be able to show an user profile', async () => {
    const auth = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'test@email.com',
        password: 'test-password'
      });

    const response = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${auth.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
    expect(response.body.user.email).toEqual('test@email.com');
  });

});
