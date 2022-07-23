import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { User } from "@modules/users/entities/User";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { hash } from "bcryptjs";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";

let createStatementUseCase: CreateStatementUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let mockUser: ICreateUserDTO;
let user: User;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create Statement Use Case', () => {

  beforeEach(async () => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);

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

  it('should be able to do a deposit', async () => {
    const result = await createStatementUseCase.execute({
      user_id: user.id,
      type: 'deposit' as OperationType,
      amount: 100,
      description: 'fake-deposit-description'
    });

    expect(result).toHaveProperty('id');
    expect(result.type).toEqual('deposit');
    expect(result.amount).toEqual(100);
  });

  it('should be able to do a withdraw', async () => {
    await createStatementUseCase.execute({
      user_id: user.id,
      type: 'deposit' as OperationType,
      amount: 100,
      description: 'fake-deposit-description'
    });

    const result = await createStatementUseCase.execute({
      user_id: user.id,
      type: 'withdraw' as OperationType,
      amount: 50,
      description: 'fake-withdraw-description'
    });

    expect(result).toHaveProperty('id');
    expect(result.type).toEqual('withdraw');
    expect(result.amount).toEqual(50);
  });

  it('should not be able to create a statement for a non-existing user', async () => {
    await expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'fake-user-id',
        type: 'deposit' as OperationType,
        amount: 100,
        description: 'fake-deposit-description'
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('should not be able to do a withdraw when balance is less than the requested amount', async () => {
    await expect(async () => {
      await createStatementUseCase.execute({
        user_id: user.id,
        type: 'deposit' as OperationType,
        amount: 100,
        description: 'fake-deposit-description'
      });

      await createStatementUseCase.execute({
        user_id: user.id,
        type: 'withdraw' as OperationType,
        amount: 200,
        description: 'fake-withdraw-description'
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

});
