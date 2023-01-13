import { Injectable, Scope } from '@nestjs/common';
import { OrderedNestDataLoader } from 'src/common/dataloader';
import { JwtAuth } from 'src/types';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Injectable({ scope: Scope.REQUEST })
export class UsersLoader extends OrderedNestDataLoader<User['name'], User> {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  protected getOptions = (auth: JwtAuth) => ({
    propertyKey: 'name',
    query: () => this.usersService.getUsers(auth),
  });
}
