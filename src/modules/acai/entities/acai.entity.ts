import { IceCreamSize } from "src/modules/ice-cream-size/entities/ice-cream-size.entity";
import { AcaiAdditional } from "src/modules/order/entities/order-additional.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Acai {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sizeId: string;

  @Column({ nullable: true })
  inCup: boolean;

  @ManyToOne(() => IceCreamSize, { eager: true })
  @JoinColumn()
  size: IceCreamSize;

  @OneToMany(() => AcaiAdditional, acaiAdditional => acaiAdditional.acai, { cascade: true, eager: true })
  additionals: AcaiAdditional[];
}
