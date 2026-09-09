import axios from 'axios';
import API_URL, { apiClient } from '../config/api';

export const authService = {
  // Registro - mapea campos del formulario frontend al DTO del backend
  async register(datosRegistro) {
    try {
      // Mapeo correcto: cedula→ci, correo→email, celular→telefono, nombreCompleto→nombre_completo
      const payload = {
        ci: datosRegistro.ci || datosRegistro.cedula || '',
        nombre_completo: datosRegistro.nombre_completo || datosRegistro.nombreCompleto || '',
        email: datosRegistro.email || datosRegistro.correo || '',
        telefono: String(datosRegistro.telefono || datosRegistro.celular || ''),
        departamento: datosRegistro.departamento || '',
        // representaEmpresa 'si'/'no' → tipo_persona 'EMPRESA'/'NATURAL'
        tipo_persona: datosRegistro.tipo_persona || (datosRegistro.representaEmpresa === 'si' ? 'EMPRESA' : 'NATURAL'),
        // Password por defecto si no viene del formulario (backend también tiene fallback)
        password: datosRegistro.password || 'Bomberos2026*',
        // Opcionales del DTO
        ...(datosRegistro.provincia && { provincia: datosRegistro.provincia }),
        ...(datosRegistro.municipio && { municipio: datosRegistro.municipio }),
        ...(datosRegistro.area && { area: datosRegistro.area }),
      };

      const response = await apiClient.post(`/auth/register`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión con el servidor' };
    }
  },

  // Login - maneja respuesta {requiereOtp:true} sin guardar token aún
  async login(credenciales) {
    try {
      // Normaliza email/correo para compatibilidad
      const payload = {
        email: credenciales.email || credenciales.correo || '',
        password: credenciales.password || '',
      };
      // Alias correo para backend que acepta ambos
      if (credenciales.correo && !credenciales.email) {
        payload.correo = credenciales.correo;
      }

      const response = await apiClient.post(`/auth/login`, payload);

      // Si el backend devuelve requiereOtp, NO guardar token aún - esperar verifyOtp
      if (response.data.requiereOtp) {
        return response.data;
      }

      // Si vino token directo (flujo sin OTP), guardar token y rol
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          const role = response.data.user.role || response.data.user.tipo_persona || 'EXTERNO';
          localStorage.setItem('userRole', role);
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al iniciar sesión' };
    }
  },

  // Verificación OTP real - POST /api/auth/verify-otp -> guarda token y userRole
  async verifyOtp(datos) {
    try {
      const email = datos.email || datos.correo || '';
      const codigo = datos.codigo || datos.otp || '';
      const response = await apiClient.post(`/auth/verify-otp`, { email, codigo });

      // Guardar token y rol cuando la verificación es exitosa
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          const role = response.data.user.role || response.data.user.tipo_persona || 'EXTERNO';
          localStorage.setItem('userRole', role);
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al verificar código OTP' };
    }
  },

  // Reenvío de código OTP - POST /api/auth/resend-otp
  async resendOtp(emailOrObj) {
    try {
      const email = typeof emailOrObj === 'string' ? emailOrObj : (emailOrObj?.email || emailOrObj?.correo || '');
      if (!email) throw { message: 'Email es requerido para reenviar código' };
      const response = await apiClient.post(`/auth/resend-otp`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al reenviar código' };
    }
  },

  // Alias para compatibilidad con instrucción "reenviarCodigo"
  async reenviarCodigo(emailOrObj) {
    return this.resendOtp(emailOrObj);
  },

  // 🔌 Método preparado para SEGIP (Simulación actual / Listo para producción backend)
  async consultarSegip(ci) {
    // ----------------------------------------------------
    // FUTURO (Cuando conectes la API real en tu backend):
    // const response = await axios.get(`${API_URL}/segip/verificar/${ci}`);
    // return response.data; 
    // ----------------------------------------------------

    // SIMULACIÓN ACTUAL:
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (ci.length >= 6) {
          const nombreSimulado = ci === '9905200' 
            ? 'JUAN PÉREZ (Verificado SEGIP)' 
            : `CIUDADANO REGISTRADO ${ci}`;
          resolve({ nombre_completo: nombreSimulado });
        } else {
          reject({ message: 'Carnet no válido' });
        }
      }, 500);
    });
  },

  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    if (token === 'token-otp-verificado') return false;
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return false;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        // Token expirado -> limpiar
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  getUser() {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getUserRole() {
    return localStorage.getItem('userRole') || this.getUser()?.role || null;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  }
};
