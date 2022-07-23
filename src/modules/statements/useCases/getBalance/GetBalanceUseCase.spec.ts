import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { User } from "@modules/users/entities/User";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { hash } from "bcryptjs";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let mockUser: ICreateUserDTO;
let user: User;

describe('Get Balance Use Case', () => {

  beforeEach(async () => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory);

    mockUser = {
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'fake-password'
    }

    user = await usersRepositoryInMemory.create({
      ...mockUser,
      password: await hash(mockUser.password, 8)
    });
  });

  it('should be able to get balance from an user', async () => {
    const result = await getBalanceUseCase.execute({
      user_id: user.id
    });

    expect(result).toHaveProperty('balance');
    expect(result).toHaveProperty('statement');
    expect(result.statement).toBeInstanceOf(Array);
  });

  it('should not be able to get balance from a non-existing user', async () => {
    await expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'fake-id'
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });

});
