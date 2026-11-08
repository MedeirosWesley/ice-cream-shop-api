import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Chaves de pagamentos já aplicados, para um reenvio não somar de novo. */
@Entity('order_payment_key')
export class OrderPaymentKey {
  @PrimaryColumn({ type: 'varchar' })
  key: string;

  @Column({ type: 'varchar' })
  orderId: string;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
