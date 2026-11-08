import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { env } from "../env";
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: env.dbPath,
      synchronize: env.dbSynchronize,
      autoLoadEntities: true,
      logging: ['error'],
      // logging: ['error', 'query', 'schema'],
      logger: 'advanced-console',
    }),
  ],
})
export class TypeOrmConfig { }