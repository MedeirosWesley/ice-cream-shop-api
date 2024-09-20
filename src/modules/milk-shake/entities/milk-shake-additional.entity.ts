import { Additional } from "src/modules/additional/entities/additional.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MilkShake } from "./milk-shake.entity";

@Entity()
export class MilkShakeAdditional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column()
  isSeparated: boolean;

  @ManyToOne(() => MilkShake, milkShake => milkShake.additionals, { onDelete: 'CASCADE' })
  @JoinColumn()
  milkShake: MilkShake;

  @ManyToOne(() => Additional, { eager: true })
  @JoinColumn()
  additional: Additional;
}
