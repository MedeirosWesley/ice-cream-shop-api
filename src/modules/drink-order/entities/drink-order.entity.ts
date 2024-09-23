import { Drink } from "src/modules/drink/entities/drink.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class DrinkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  drinkId: string;

  @ManyToOne(() => Drink, { eager: true })
  @JoinColumn()
  drink: Drink;
}
