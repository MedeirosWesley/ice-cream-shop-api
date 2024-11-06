import { OtherProduct } from "src/modules/other-product/entities/other-product.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class OtherProductOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  otherProductId: string;

  @ManyToOne(() => OtherProduct, { eager: true })
  @JoinColumn()
  otherProduct: OtherProduct;
}
