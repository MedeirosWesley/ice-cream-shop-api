import { IceCreamFlavor } from "src/modules/ice-cream-flavor/entities/ice-cream-flavor.entity";
import { OrderIceCreamFlavor } from "src/modules/ice-cream-flavor/entities/order-ice-cream-flavor.entity";
import { IceCreamSize } from "src/modules/ice-cream-size/entities/ice-cream-size.entity";
import { IceCreamSyrup } from "src/modules/ice-cream-syrup/entities/ice-cream-syrup.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MilkShakeAdditional } from "./milk-shake-additional.entity";

@Entity()
export class MilkShake {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sizeId: string;

  @Column()
  syrupId: string;

  @ManyToOne(() => IceCreamSize, { eager: true })
  @JoinColumn()
  size: IceCreamSize;

  @ManyToOne(() => IceCreamSyrup, { eager: true })
  @JoinColumn()
  syrup: IceCreamSyrup;

  @OneToMany(() => MilkShakeAdditional, MilkShakeAdditional => MilkShakeAdditional.milkShake, { cascade: true, eager: true })
  additionals: MilkShakeAdditional[];

  @OneToMany(() => OrderIceCreamFlavor, orderIceCreamFlavor => orderIceCreamFlavor.milkshake, { cascade: true, eager: true })
  flavors: OrderIceCreamFlavor[];
}