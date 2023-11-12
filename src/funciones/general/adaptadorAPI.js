import axios from "axios";

/**
 * Crea una instancia de axios basada en baseURL
 * @param {string} baseURL 
 * @returns instancia axios
 */
export const crearInstanciaAxios = (baseURL/*, configs*/) => {
  /**
  * @todo verificar que baseURL esté dentro de los módulos posibles.
  */
  return axios.create({
    baseURL,
    // configs
    /**
    * @todo investigar qué otras opciones de axios se pueden incorporar.
    */
  });
}

/**
 * Retorna una instancia axios lista para realizar peticiones a la API.
 * En request incorpora lógica de enviar el jwt.
 * En response incorpora lógica de verificar el código 401 respecto de la sesión.
 * El resto de los errores se response se deben gestionar en el errorHandler.
 * @param {string} moduloNombre 
 * @returns instancia axios.
 */
export const construirAdaptador = () => {

  const baseURL = import.meta.env.VITE_APP_BACKEND_SERVER_IP

  const instancia = crearInstanciaAxios(baseURL);

  return instancia;
}