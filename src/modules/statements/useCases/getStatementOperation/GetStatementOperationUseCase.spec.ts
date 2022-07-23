import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { User } from "@modules/users/entities/User";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { hash } from "bcryptjs";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { Statement } from "@modules/statements/entities/Statement";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let mockUser: ICreateUserDTO;
let user: User;
let mockStatement: ICreateStatementDTO;
let statement: Statement;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Statement Operation Use Case', () => {

  beforeEach(async () => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);

    mockUser = {
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'fake-password'
    }

    user = await usersRepositoryInMemory.create({
      ...mockUser,
      password: await hash(mockUser.password, 8)
    });

    mockStatement = {
      user_id: user.id,
      type: 'deposit' as OperationType,
      amount: 100,
      description: 'fake-deposit-description'
    }

    statement = await statementsRepositoryInMemory.create(mockStatement);
  });

  it('should be able to get a statement operation', async () => {
    const result = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: statement.id
    });

    expect(result).toHaveProperty('id');
    expect(result.type).toEqual('deposit');
    expect(result.amount).toEqual(100);
  });

  it('should not be able to get a statement operation for a non-existing user', async () => {
    await expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: 'fake-user-id',
        statement_id: statement.id
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('should not be able to get a statement operation for a non-existing statement', async () => {
    await expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: 'fake-statement-id'
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

});
