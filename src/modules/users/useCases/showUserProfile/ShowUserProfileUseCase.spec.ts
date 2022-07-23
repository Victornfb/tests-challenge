import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { hash } from "bcryptjs";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { User } from "../../entities/User";
import { ShowUserProfileError } from "./ShowUserProfileError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let mockUser: ICreateUserDTO;
let user: User;

describe('Show User Profile Use Case', () => {

  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);

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

  it('should be able to show an user profile', async () => {
    const result = await showUserProfileUseCase.execute(user.id);

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('email');
    expect(result.email).toEqual(mockUser.email);
  });

  it('should not be able to show a non-existing user profile', async () => {
    await expect(async () => {
      await showUserProfileUseCase.execute('fake-id');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });

});
