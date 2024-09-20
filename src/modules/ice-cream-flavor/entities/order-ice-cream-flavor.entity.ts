import { MilkShake } from "src/modules/milk-shake/entities/milk-shake.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IceCreamFlavor } from "./ice-cream-flavor.entity";

@Entity()
export class OrderIceCreamFlavor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MilkShake, milkShake => milkShake.flavors, { onDelete: 'CASCADE' })
  @JoinColumn()
  milkshake: MilkShake;

  @ManyToOne(() => IceCreamFlavor, { eager: true })
  @JoinColumn()
  iceCreamFlavor: IceCreamFlavor;
}