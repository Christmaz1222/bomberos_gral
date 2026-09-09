"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const dto_1 = require("./dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerDto) {
        console.log(`📝 New registration: ${registerDto.email}`);
        return this.authService.register(registerDto);
    }
    async forgotPassword(body) {
        console.log(`🔑 Forgot password: ${body.email}`);
        return this.authService.forgotPassword({ email: body.email });
    }
    async resetPassword(body) {
        console.log(`🔄 Reset password`);
        const nuevaPassword = body.nuevaPassword || body.newPassword;
        return this.authService.resetPassword({ token: body.token, nuevaPassword });
    }
    async login(loginDto) {
        const email = loginDto.email || loginDto.correo;
        console.log(`📥 Login intent: ${email}`);
        return this.authService.login({ email, password: loginDto.password });
    }
    async verifyOtp(verifyOtpDto) {
        console.log(`✅ Verify OTP: ${verifyOtpDto.email}`);
        return this.authService.verifyOtp({
            email: verifyOtpDto.email,
            codigo: verifyOtpDto.codigo,
        });
    }
    async resendOtp(resendOtpDto) {
        const email = resendOtpDto.email || resendOtpDto.correo;
        console.log(`🔄 Resend OTP: ${email}`);
        return this.authService.resendOtp({ email });
    }
    async exchangeKerverosToken(dto) {
        console.log(`🔐 Kerveros exchange attempt`);
        try {
            return await this.authService.exchangeKerverosToken(dto.token);
        }
        catch (error) {
            console.error(`❌ Kerveros exchange failed:`, error.message);
            throw error;
        }
    }
    async kerverosCallback(token) {
        console.log(`🔐 Kerveros callback received`);
        if (!token) {
            return {
                success: false,
                message: 'Token de Kerveros no proporcionado',
                redirectUrl: '/login?error=kerveros_token_missing',
            };
        }
        try {
            const result = await this.authService.exchangeKerverosToken(token);
            return {
                success: true,
                token: result.token,
                user: result.user,
                redirectUrl: '/admin/dashboard',
            };
        }
        catch (error) {
            console.error(`❌ Kerveros callback failed:`, error.message);
            return {
                success: false,
                message: error.message || 'Error al procesar token de Kerveros',
                redirectUrl: '/login?error=kerveros_invalid',
            };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('resend-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ResendOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendOtp", null);
__decorate([
    (0, common_1.Post)('kerveros/exchange'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.KerverosExchangeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "exchangeKerverosToken", null);
__decorate([
    (0, common_1.Get)('kerveros/callback'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "kerverosCallback", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map