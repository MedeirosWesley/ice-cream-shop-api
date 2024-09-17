import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "db/sql.sqlite",
      synchronize: true,
      autoLoadEntities: true,
    }),
  ],
})
export class TypeOrmConfig { }