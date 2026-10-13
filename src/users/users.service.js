"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    constructor(db) {
        this.db = db;
        this.pool = () => this.db.getPool();
    }
    async createUser(username, password, role = 'user') {
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await this.pool().execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashed, role]);
        return { id: result.insertId, username, role };
    }
    async findByUsername(username) {
        const [rows] = await this.pool().execute('SELECT id, username, password, role, refresh_token FROM users WHERE username = ?', [username]);
        return rows[0];
    }
    async findById(id) {
        const [rows] = await this.pool().execute('SELECT id, username, role, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }
    async getAll() {
        const [rows] = await this.pool().execute('SELECT id, username, role, created_at FROM users');
        return rows;
    }
    async updateUser(id, partial) {
        const fields = [];
        const values = [];
        if (partial.username) {
            fields.push('username = ?');
            values.push(partial.username);
        }
        if (partial.password) {
            const hashed = await bcrypt.hash(partial.password, 10);
            fields.push('password = ?');
            values.push(hashed);
        }
        if (partial.role) {
            fields.push('role = ?');
            values.push(partial.role);
        }
        if (fields.length === 0)
            return await this.findById(id);
        values.push(id);
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        await this.pool().execute(sql, values);
        return this.findById(id);
    }
    async deleteUser(id) {
        const [res] = await this.pool().execute('DELETE FROM users WHERE id = ?', [id]);
        return res.affectedRows > 0;
    }
    async setRefreshToken(id, refreshToken) {
        await this.pool().execute('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, id]);
    }
    async findByRefreshToken(refreshToken) {
        const [rows] = await this.pool().execute('SELECT id, username, role FROM users WHERE refresh_token = ?', [refreshToken]);
        return rows[0];
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], UsersService);
