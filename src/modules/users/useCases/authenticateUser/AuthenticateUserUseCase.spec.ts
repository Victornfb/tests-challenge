import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { hash } from "bcryptjs";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let mockUser: ICreateUserDTO;

describe('Authenticate User Use Case', () => {

  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);

    mockUser = {
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'fake-password'
    }

    await usersRepositoryInMemory.create({
      ...mockUser,
      password: await hash(mockUser.password, 8)
    });
  });

  it('should be able to authenticate an user', async () => {
    const result = await authenticateUserUseCase.execute({
      email: mockUser.email,
      password: mockUser.password
    });

    expect(result).toHaveProperty('token');
  });

  it('should not be able to authenticate an user with an invalid email', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'incorrect@email.com',
        password: mockUser.password
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('should not be able to authenticate an user with an invalid password', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: mockUser.email,
        password: 'incorrect-password'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

});
