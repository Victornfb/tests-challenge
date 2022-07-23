import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User Use Case', () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it('should be able to create a new user', async () => {
    const result = await createUserUseCase.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'fake-password'
    });

    expect(result).toHaveProperty('id')
  });

  it('should not be able to create a user with an used email', async () => {
    await expect(async () => {
      await createUserUseCase.execute({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'fake-password'
      });

      await createUserUseCase.execute({
        name: 'John Doe 2',
        email: 'john@doe.com',
        password: 'fake-password-2'
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });

});
