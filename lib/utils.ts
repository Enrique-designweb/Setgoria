// lib/utils.ts
export function validateCubanCI(ci: string, providedBirthDate: string | Date): { isValid: boolean; message: string } {
  // Limpiamos el CI (quitamos guiones o espacios)
  const cleanCI = ci.replace(/\D/g, "");
  
  // El CI cubano tiene 11 dígitos: YYMMDD + 5 dígitos
  if (cleanCI.length !== 11) {
    return { isValid: false, message: "El CI debe tener 11 dígitos." };
  }

  // Extraemos la fecha (Año, Mes, Día)
  const yearStr = cleanCI.substring(0, 2);
  const monthStr = cleanCI.substring(2, 4);
  const dayStr = cleanCI.substring(4, 6);

  let year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Lógica del siglo (si el año es mayor al año actual en 2 dígitos, es del 1900, sino del 2000)
  const currentYear2Digits = new Date().getFullYear() % 100;
  if (year > currentYear2Digits) {
    year += 1900;
  } else {
    year += 2000;
  }

  const ciBirthDate = new Date(year, month - 1, day);
  
  // Comparamos la fecha del CI con la fecha que puso en el formulario
  const inputDate = new Date(providedBirthDate);
  
  if (ciBirthDate.getTime() !== inputDate.getTime()) {
    return { isValid: false, message: "La fecha de nacimiento no coincide con el Carnet de Identidad." };
  }

  // Calculamos la edad
  const today = new Date();
  let age = today.getFullYear() - ciBirthDate.getFullYear();
  const m = today.getMonth() - ciBirthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < ciBirthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return { isValid: false, message: "Debes ser mayor de 18 años." };
  }

  return { isValid: true, message: "Verificado correctamente." };
}
