import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PartStatus } from '../../../common/enums';
import { Car } from '../../car/entities/car.entity';

@Entity('parts')
export class Part {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  car_id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  part_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unit_price: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'boolean', default: false })
  is_original: boolean;

  @Column({ type: 'date', nullable: true })
  order_date: Date;

  @Column({ type: 'date', nullable: true })
  arrival_date: Date;

  @Column({
    type: 'enum',
    enum: PartStatus,
    default: PartStatus.PENDING,
  })
  status: PartStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Car, (car) => car.parts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'car_id' })
  car: Car;
}
