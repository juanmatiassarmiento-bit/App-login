const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarRegistro({ nombre, email, password, confirmacion }) {
  if (!nombre.trim() || !email.trim() || !password || !confirmacion) {
    return 'Completa todos los campos para crear tu cuenta.';
  }
  if (nombre.trim().length < 3) {
    return 'El nombre de usuario debe tener al menos 3 caracteres.';
  }
  if (!correoValido.test(email.trim())) {
    return 'Escribe un correo electrónico válido.';
  }
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (password !== confirmacion) {
    return 'Las contraseñas no coinciden.';
  }
  return '';
}

export function validarLogin({ email, password }) {
  if (!email.trim() || !password) {
    return 'Escribe tu correo y contraseña.';
  }
  if (!correoValido.test(email.trim())) {
    return 'Escribe un correo electrónico válido.';
  }
  return '';
}

export function traducirErrorAuth(message = '') {
  const texto = message.toLowerCase();
  if (texto.includes('invalid login')) return 'El correo o la contraseña son incorrectos.';
  if (texto.includes('already registered')) return 'Este correo ya está registrado.';
  if (texto.includes('at least 6')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (texto.includes('not confirmed')) return 'Primero confirma tu correo electrónico.';
  if (texto.includes('rate limit')) return 'Hubo muchos intentos. Espera un momento.';
  if (texto.includes('email')) return 'Revisa que el correo electrónico sea válido.';
  return 'No se pudo completar la operación. Inténtalo nuevamente.';
}