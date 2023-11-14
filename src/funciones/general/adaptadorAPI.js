import axios from "axios";

export const crearInstanciaAxios = (baseURL/*, configs*/) => {
  return axios.create({
    baseURL,
  });
}

export const construirAdaptador = () => {

  const baseURL = import.meta.env.VITE_APP_BACKEND_SERVER_IP

  const instancia = crearInstanciaAxios(baseURL);

  instancia.interceptors.request.use(request => {
    const token = localStorage.getItem('token')
    request.headers.authorization = "Bearer " + token;
    return request;
  });

  return instancia;
}