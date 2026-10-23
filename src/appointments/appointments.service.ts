
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AppointmentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    const [rows] = await this.databaseService.getPool().query(
      'SELECT * FROM appointments',
    );
    return rows;
  }

  async findOne(id: number) {
    const [rows]: any = await this.databaseService.getPool().query(
      'SELECT * FROM appointments WHERE appointment_id = ?',
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Appointment not found');
    }

    return rows[0];
  }

  async create(data: any) {
    const {
      pet_id,
      appointment_date,
      appointment_time,
      status,
    } = data;

    const [result]: any = await this.databaseService.getPool().query(
      `INSERT INTO appointments
       (pet_id, appointment_date, appointment_time, status)
       VALUES (?, ?, ?, ?)`,
      [
        pet_id,
        appointment_date,
        appointment_time,
        status ?? 'Scheduled',
      ],
    );

    return {
      message: 'Appointment created successfully',
      appointment_id: result.insertId,
    };
  }

  async update(id: number, data: any) {
    const appointment: any = await this.findOne(id);

    const {
      pet_id = appointment.pet_id,
      appointment_date = appointment.appointment_date,
      appointment_time = appointment.appointment_time,
      status = appointment.status,
    } = data;

    await this.databaseService.getPool().query(
      `UPDATE appointments
       SET pet_id = ?,
           appointment_date = ?,
           appointment_time = ?,
           status = ?
       WHERE appointment_id = ?`,
      [pet_id, appointment_date, appointment_time, status, id],
    );

    return {
      message: 'Appointment updated successfully',
      appointment_id: id,
    };
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.databaseService.getPool().query(
      'DELETE FROM appointments WHERE appointment_id = ?',
      [id],
    );

    return {
      message: 'Appointment deleted successfully',
      appointment_id: id,
    };
  }
}
