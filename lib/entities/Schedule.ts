import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("studyflow_schedule")
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", length: 10 })
  day_of_week: string

  @Column({ type: "varchar", length: 20 })
  time_slot: string

  @Column({ type: "varchar", length: 255 })
  subject: string

  @Column({ type: "varchar", length: 100, nullable: true })
  room: string

  @Column({ type: "varchar", length: 255, nullable: true })
  instructor: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
