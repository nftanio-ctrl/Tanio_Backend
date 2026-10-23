
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(data: any) {
    const pool = this.databaseService.getPool();
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const [result]: any = await pool.execute(
      `INSERT INTO users
       (first_name, last_name, username, email, password, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.first_name,
        data.last_name,
        data.username,
        data.email,
        hashedPassword,
        data.phone || null,
      ],
    );

    return {
      message: 'User created successfully',
      user_id: result.insertId,
      username: data.username,
    };
  }

  async findByUsername(username: string) {
    const pool = this.databaseService.getPool();

    const [rows]: any = await pool.execute(
      `SELECT user_id, first_name, last_name, username,
              email, password, phone
       FROM users WHERE username = ?`,
      [username],
    );

    return rows[0] || null;
  }

  async getAll() {
    const pool = this.databaseService.getPool();

    const [rows]: any = await pool.execute(
      `SELECT user_id, first_name, last_name,
              username, email, phone
       FROM users`,
    );

    return rows;
  }

  async findById(id: number) {
    const pool = this.databaseService.getPool();

    const [rows]: any = await pool.execute(
      `SELECT user_id, first_name, last_name,
              username, email, phone
       FROM users WHERE user_id = ?`,
      [id],
    );

    return rows[0] || null;
  }

  async updateUser(id: number, data: any) {
    const pool = this.databaseService.getPool();
    const existingUser = await this.findById(id);

    if (!existingUser) {
      return { message: 'User not found' };
    }

    const [result]: any = await pool.execute(
      `UPDATE users
       SET first_name = ?, last_name = ?, username = ?,
           email = ?, phone = ?
       WHERE user_id = ?`,
      [
        data.first_name ?? existingUser.first_name,
        data.last_name ?? existingUser.last_name,
        data.username ?? existingUser.username,
        data.email ?? existingUser.email,
        data.phone ?? existingUser.phone,
        id,
      ],
    );

    return {
      message: 'User updated successfully',
      affectedRows: result.affectedRows,
    };
  }

  async deleteUser(id: number) {
    const pool = this.databaseService.getPool();

    const [result]: any = await pool.execute(
      'DELETE FROM users WHERE user_id = ?',
      [id],
    );

    return {
      message:
        result.affectedRows > 0
          ? 'User deleted successfully'
          : 'User not found',
      affectedRows: result.affectedRows,
    };
  }
}
