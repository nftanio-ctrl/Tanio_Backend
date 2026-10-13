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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcryptjs"));
const jwt_1 = require("@nestjs/jwt");
const jwt = __importStar(require("jsonwebtoken"));
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(username, pass) {
        const user = await this.usersService.findByUsername(username);
        if (!user)
            return null;
        const valid = await bcrypt.compare(pass, user.password);
        if (valid)
            return { id: user.id, username: user.username, role: user.role };
        return null;
    }
    async login(user) {
        const payload = { sub: user.id, username: user.username, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        // Create refresh token using separate secret so you can revoke access by changing refresh secret
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret', { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' });
        await this.usersService.setRefreshToken(user.id, refreshToken);
        return { accessToken, refreshToken };
    }
    async logout(userId) {
        await this.usersService.setRefreshToken(userId, null);
        return { ok: true };
    }
    async refreshTokens(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret');
            const user = await this.usersService.findById(decoded.sub);
            if (!user)
                throw new common_1.UnauthorizedException('Invalid refresh token');
            const found = await this.usersService.findByRefreshToken(refreshToken);
            if (!found)
                throw new common_1.UnauthorizedException('Invalid refresh token (not found)');
            const payload = { sub: found.id, username: found.username, role: found.role };
            const accessToken = this.jwtService.sign(payload);
            const newRefresh = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret', { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' });
            await this.usersService.setRefreshToken(found.id, newRefresh);
            return { accessToken, refreshToken: newRefresh };
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Could not refresh tokens');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService, jwt_1.JwtService])
], AuthService);
