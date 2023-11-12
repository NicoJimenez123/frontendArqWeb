import { toastAdd } from "@/main";

export function errorHandler(err) {
  switch(err.code) {
    case "ERR_NETWORK":
      toastAdd.add({
        severity: "error",
        summary: "Error de Conexión",
        detail: "No se pudo conectar con el servidor",
        life: 5000,
      })
      break
    case "ERR_BAD_REQUEST":
      switch(err.response.status) {
        case 401:
          // Lo gestiona el interceptor de las llamadas api.
          break;
        case 403:
          toastAdd.add({
            severity: "error",
            summary: "Sin acceso",
            detail: "No tenés permisos para acceder a este recurso.",
            life: 5000,
          });
          break;
        default:
          toastAdd.add({
            severity: "error",
            summary: "Error al procesar los datos",
            detail: `Código de error ${err.response.status}. Mensaje: ${err.response.data.message}`,
            life: 5000,
          });
        break;
      }
      break;
    case "ERROR_CAMPOS_SELECCIONADOS":
      toastAdd.add({
        severity: "error",
        summary: "Error",
        detail: "Debe seleccionar los campos con *",
        life: 5000,
      })
      break
    default: 
      toastAdd.add({
        severity: "error",
        summary: "Error al procesar los datos",
        detail: "Código" + err.code,
        life: 5000,
      });
  }
}