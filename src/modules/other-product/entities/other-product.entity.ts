import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class OtherProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  type: number;

  @Column({ default: true })
  availability: boolean;
}


