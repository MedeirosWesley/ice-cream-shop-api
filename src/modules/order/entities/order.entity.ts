import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, BeforeInsert, getRepository, Index } from 'typeorm';
import { OrderProduct } from './order-product.entity';
import { MotorcycleCourier } from 'src/modules/motorcycle_courier/entities/motorcycle_courier.entity';
import { Client } from 'src/modules/client/entities/client.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  productIndex: number;

  @Column({ nullable: true })
  clientId: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;


  @Column({ type: 'decimal', nullable: true })
  cashChange: number;

  @Column({ nullable: true })
  toTake: boolean;

  @Column({ nullable: true })
  isInStorePickup: boolean;

  @Column({ nullable: true })
  clientName: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  type: string;

  @Column({ type: 'decimal', nullable: true })
  amountPaid: number;

  @Column({ type: 'decimal', nullable: true })
  total: number;

  @Column({ type: 'decimal', nullable: true })
  deliveryFee: number;

  @Column({ nullable: true })
  motorcycleCourierId: string;

  // Gerada no app para pedidos que podem ser reenviados. Nula nos antigos.
  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true })
  idempotencyKey: string | null;

  // Preenchida ao reservar a impressão, para o cupom sair uma única vez.
  @Column({ type: 'datetime', nullable: true })
  printClaimedAt: Date | null;

  @ManyToOne(() => Client, { eager: true })
  @JoinColumn()
  client: Client;

  @ManyToOne(() => MotorcycleCourier, { eager: true })
  @JoinColumn()
  motorcycleCourier: MotorcycleCourier;

  @OneToMany(() => OrderProduct, orderProduct => orderProduct.order, { cascade: true })
  products: OrderProduct[];
}
