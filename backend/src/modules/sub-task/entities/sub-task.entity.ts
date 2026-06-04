import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProcessStatus } from '../../../common/enums';
import { Process } from '../../process/entities/process.entity';

@Entity('sub_tasks')
export class SubTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  process_id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  task_order: number;

  @Column({
    type: 'enum',
    enum: ProcessStatus,
    default: ProcessStatus.PENDING,
  })
  status: ProcessStatus;

  @ManyToOne(() => Process, (process) => process.subTasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'process_id' })
  process: Process;
}
