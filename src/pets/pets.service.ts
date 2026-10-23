
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PetsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    const [rows] = await this.databaseService.getPool().query(
      'SELECT * FROM pets',
    );
    return rows;
  }

  async findOne(id: number) {
    const [rows]: any = await this.databaseService.getPool().query(
      'SELECT * FROM pets WHERE pet_id = ?',
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Pet not found');
    }

    return rows[0];
  }

  async create(data: any) {
    const { user_id, pet_name, species, breed, age } = data;

    const [result]: any = await this.databaseService.getPool().query(
      `INSERT INTO pets (user_id, pet_name, species, breed, age)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, pet_name, species, breed ?? null, age ?? null],
    );

    return {
      message: 'Pet created successfully',
      pet_id: (result as any).insertId,
    };
  }

  async update(id: number, data: any) {
    const pet: any = await this.findOne(id);

    const [result]: any = await this.databaseService.getPool().query(
      `UPDATE pets
       SET user_id = ?, pet_name = ?, species = ?, breed = ?, age = ?
       WHERE pet_id = ?`,
      [
        data.user_id ?? pet.user_id,
        data.pet_name ?? pet.pet_name,
        data.species ?? pet.species,
        data.breed ?? pet.breed,
        data.age ?? pet.age,
        id,
      ],
    );

    return {
      message: 'Pet updated successfully',
      pet_id: id,
    };
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.databaseService.getPool().query(
      'DELETE FROM pets WHERE pet_id = ?',
      [id],
    );

    return {
      message: 'Pet deleted successfully',
      pet_id: id,
    };
  }
}
