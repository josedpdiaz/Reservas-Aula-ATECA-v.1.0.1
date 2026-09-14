import { Usuario } from '../types';
import { ATECA_SECURITY_TOKEN } from './serverSync';
import { setCurrentUser, setUsuarios, getUsuarios } from './storage';

export interface RequestCodeResult {
  success: boolean;
  error?: string;
  expiresIn?: number;
}

export interface VerifyCodeResult {
  success: boolean;
  user?: Usuario;
  error?: string;
  remainingAttempts?: number;
}

/**
 * Solicita el código de 6 dígitos que se enviará automáticamente al correo del usuario.
 */
export async function requestLoginCode(email: string): Promise<RequestCodeResult> {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    return { success: false, error: 'Introduce una dirección de correo válida.' };
  }

  if (!cleanEmail.endsWith('@gobiernodecanarias.org')) {
    return {
      success: false,
      error: 'Acceso restringido: Debes identificarte con tu cuenta oficial del Gobierno de Canarias (@gobiernodecanarias.org).'
    };
  }

  try {
    const res = await fetch('/api.php?action=request_login_code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ateca-Token': ATECA_SECURITY_TOKEN,
      },
      body: JSON.stringify({ email: cleanEmail }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        expiresIn: data.expires_in || 300,
      };
    } else {
      return {
        success: false,
        error: data.error || 'No se pudo enviar el código de acceso.',
      };
    }
  } catch (err) {
    console.error('Error al solicitar código OTP:', err);

    // Si estamos en desarrollo local puro (Vite dev server en localhost sin backend PHP activo)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.warn('Simulando envío OTP en localhost dev mode...');
      return {
        success: true,
        expiresIn: 300,
      };
    }

    return {
      success: false,
      error: 'Error de comunicación con el servidor. Revisa tu conexión e inténtalo de nuevo.',
    };
  }
}

/**
 * Verifica el código de 6 dígitos introducido por el usuario.
 */
export async function verifyLoginCode(email: string, code: string): Promise<VerifyCodeResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  if (!cleanEmail || !cleanCode) {
    return { success: false, error: 'Debes introducir el código de verificación.' };
  }

  try {
    const res = await fetch('/api.php?action=verify_login_code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ateca-Token': ATECA_SECURITY_TOKEN,
      },
      body: JSON.stringify({
        email: cleanEmail,
        code: cleanCode,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      const authenticatedUser: Usuario = data.user;

      // Actualizar la caché de sesión y el almacenamiento local
      setCurrentUser(authenticatedUser);
      const currentUsers = getUsuarios();
      if (!currentUsers.some(u => u.id_usuario === authenticatedUser.id_usuario)) {
        setUsuarios([...currentUsers, authenticatedUser]);
      }

      return {
        success: true,
        user: authenticatedUser,
      };
    } else {
      return {
        success: false,
        error: data.error || 'Código de verificación incorrecto.',
        remainingAttempts: data.remaining_attempts,
      };
    }
  } catch (err) {
    console.error('Error al verificar código OTP:', err);

    // Respaldo en entorno local de pruebas si no hay PHP
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.warn('Modo dev local: aprobando código para pruebas');
      const users = getUsuarios();
      const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
      const devUser: Usuario = existing || {
        id_usuario: 'u-dev',
        nombre: cleanEmail.split('@')[0],
        email: cleanEmail,
        rol: cleanEmail.includes('jpacdia') ? 'ADMIN' : 'PROFESOR',
        departamento: 'General',
        turno: 'Ambos',
        activo: true,
      };
      setCurrentUser(devUser);
      return { success: true, user: devUser };
    }

    return {
      success: false,
      error: 'Error al contactar con el servidor central de autenticación.',
    };
  }
}
