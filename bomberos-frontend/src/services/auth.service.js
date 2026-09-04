import axios from 'axios';
import API_URL from '../config/api';

export const authService = {
  async register(datosRegistro) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, datosRegistro);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión con el servidor' };
    }
  },

  async login(credenciales) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credenciales);
      // Guardar el token o datos de sesión si el backend los devuelve
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al iniciar sesión' };
    }
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
    // Comprueba si el token existe en el almacenamiento local
    return !!localStorage.getItem('token');
  },

  logout() {
    localStorage.removeItem('token');
  }
};