import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ProcessStatus } from '../../../common/enums';
import { Car } from '../../car/entities/car.entity';
import { SubTask } from '../../sub-task/entities/sub-task.entity';

@Entity('processes')
export class Process {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  car_id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int' })
  process_order: number;

  @Column({
    type: 'enum',
    enum: ProcessStatus,
    default: ProcessStatus.PENDING,
  })
  status: ProcessStatus;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Car, (car) => car.processes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'car_id' })
  car: Car;

  @OneToMany(() => SubTask, (subTask) => subTask.process)
  subTasks: SubTask[];
}
