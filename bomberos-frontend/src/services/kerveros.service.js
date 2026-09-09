import axios from 'axios';
import API_URL, { apiClient } from '../config/api';

// ============================================
// USUARIOS MOCK PARA DESARROLLO (Simula Kerveros)
// ============================================
const MOCK_USERS = [
  {
    ci: '9905200',
    password: '123456',
    nombre: 'CAP. JUAN PÉREZ MAMANI',
    grado: 'CAPITÁN',
    unidad: 'UNIDAD BOMBEROS LA PAZ',
    email: 'jperez@policia.bo',
    role: 'INTERNO'
  },
  {
    ci: '8812345',
    password: '123456',
    nombre: 'TEN. MARÍA GÓMEZ QUISPE',
    grado: 'TENIENTE',
    unidad: 'UNIDAD BOMBEROS SANTA CRUZ',
    email: 'mgomez@policia.bo',
    role: 'INTERNO'
  },
  {
    ci: '7711111',
    password: '123456',
    nombre: 'MY. CARLOS ROJAS FLORES',
    grado: 'MAYOR',
    unidad: 'COMANDO GENERAL BOMBEROS',
    email: 'crojas@policia.bo',
    role: 'ADMIN'
  },
  {
    ci: '6622222',
    password: '123456',
    nombre: 'SBT. ANA FLORES CONDORI',
    grado: 'SUBTENIENTE',
    unidad: 'UNIDAD BOMBEROS COCHABAMBA',
    email: 'aflores@policia.bo',
    role: 'INTERNO'
  }
];

export const kerverosService = {
  // ============================================
  // LOGIN SIMULADO CONTRA MOCK_USERS (Solo desarrollo)
  // ============================================
  async loginKerveros(ci, password) {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = MOCK_USERS.find(u => u.ci === ci && u.password === password);
    
    if (!user) {
      throw { message: 'Credenciales inválidas. Verifique su CI y contraseña.' };
    }

    // Guardar datos del usuario de Kerveros en localStorage
    const kerverosUserData = {
      ci: user.ci,
      nombre: user.nombre,
      grado: user.grado,
      unidad: user.unidad,
      email: user.email,
      role: user.role
    };
    
    localStorage.setItem('kerverosUser', JSON.stringify(kerverosUserData));
    
    // Generar token mock de Kerveros para simular el flujo real
    const mockToken = this._generateMockKerverosToken(user);
    localStorage.setItem('kerverosToken', mockToken);

    return { success: true, user: kerverosUserData, token: mockToken };
  },

  // ============================================
  // INTERCAMBIO DE TOKEN KERVEROS -> JWT BACKEND (Producción)
  // ============================================
  async exchangeKerverosToken(token) {
    try {
      const response = await apiClient.post('/auth/kerveros/exchange', { token });
      
      if (response.data.token && response.data.user) {
        // Guardar sesión final (JWT del backend)
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userRole', response.data.user.role || 'INTERNO');
        
        // Limpiar datos temporales de Kerveros
        localStorage.removeItem('kerverosToken');
        localStorage.removeItem('kerverosUser');
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al intercambiar token con el backend' };
    }
  },

  // ============================================
  // GENERAR TOKEN MOCK DE KERVEROS (Solo desarrollo)
  // Estructura similar a JWT real para pruebas
  // ============================================
  _generateMockKerverosToken(user) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      ci: user.ci,
      nombre: user.nombre,
      grado: user.grado,
      unidad: user.unidad,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hora
      iss: 'kerveros-dev.policia.bo',
      aud: 'sippci-bomberos'
    }));
    const signature = btoa('mock-signature-for-development');
    return `${header}.${payload}.${signature}`;
  },

  // ============================================
  // DECODIFICAR TOKEN MOCK (Solo desarrollo)
  // ============================================
  _decodeMockToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  },

  // ============================================
  // VERIFICAR ACCESO A SIPPCI DESDE KERVEROS
  // ============================================
  hasAccessToSippcci() {
    const kerverosUser = this.getKerverosUserData();
    // En producción: verificar rol/permisos en token Kerveros
    // En desarrollo: todos los usuarios INTERNO/ADMIN tienen acceso
    return kerverosUser && (kerverosUser.role === 'INTERNO' || kerverosUser.role === 'ADMIN');
  },

  // ============================================
  // OBTENER DATOS DEL USUARIO KERVEROS DESDE LOCALSTORAGE
  // ============================================
  getKerverosUserData() {
    try {
      const raw = localStorage.getItem('kerverosUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // ============================================
  // LOGOUT DE KERVEROS - LIMPIAR DATOS TEMPORALES
  // ============================================
  logoutKerveros() {
    localStorage.removeItem('kerverosToken');
    localStorage.removeItem('kerverosUser');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  },

  // ============================================
  // OBTENER USUARIOS MOCK PARA MOSTRAR EN LOGIN (Solo desarrollo)
  // ============================================
  getMockUsers() {
    return MOCK_USERS.map(u => ({
      ci: u.ci,
      nombre: u.nombre,
      grado: u.grado,
      unidad: u.unidad,
      password: u.password // Solo para desarrollo
    }));
  }
};