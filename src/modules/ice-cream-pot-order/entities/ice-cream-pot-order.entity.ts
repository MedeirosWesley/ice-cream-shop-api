import { IceCreamFlavor } from "src/modules/ice-cream-flavor/entities/ice-cream-flavor.entity";
import { IceCreamSize } from "src/modules/ice-cream-size/entities/ice-cream-size.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class IceCreamPotOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sizeId: string;

  @Column()
  flavorId: string;

  @ManyToOne(() => IceCreamSize, { eager: true })
  @JoinColumn()
  size: IceCreamSize;

  @ManyToOne(() => IceCreamFlavor, { eager: true })
  @JoinColumn()
  flavor: IceCreamFlavor;
}
