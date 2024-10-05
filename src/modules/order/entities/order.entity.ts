import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { OrderProduct } from './order-product.entity';
import { MotorcycleCourier } from 'src/modules/motorcycle_courier/entities/motorcycle_courier.entity';
import { Client } from 'src/modules/client/entities/client.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientId: string;

  @Column()
  paymentMethod: string;

  @Column()
  motorcycleCourierId: string;

  @ManyToOne(() => Client, { eager: true })
  @JoinColumn()
  client: Client;

  @ManyToOne(() => MotorcycleCourier, { eager: true })
  @JoinColumn()
  motorcycleCourier: MotorcycleCourier;

  @OneToMany(() => OrderProduct, orderProduct => orderProduct.order, { cascade: true })
  products: OrderProduct[];
}
