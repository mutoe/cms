import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { UserEntity } from 'src/user/user.entity'

const ormConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [UserEntity],
  dropSchema: true,
  synchronize: true,
}

export default ormConfig
