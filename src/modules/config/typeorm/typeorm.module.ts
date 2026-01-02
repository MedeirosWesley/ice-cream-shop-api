import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "db/sql.sqlite",
      synchronize: true,
      autoLoadEntities: true,
      logging: ['error'],
      // logging: ['error', 'query', 'schema'],
      logger: 'advanced-console',
    }),
  ],
})
export class TypeOrmConfig { }