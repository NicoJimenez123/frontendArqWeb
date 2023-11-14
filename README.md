### Antes de iniciar el servidor
Debe crearse un archivo .env en el directorio raíz del proyecto, utilizando la siguiente estructura:
- VITE_APP_BACKEND_SERVER_IP=''  


El VITE_APP_BACKEND_SERVER_IP es la url al servidor backend, puede utilizar 'http://localhost:3000'  


### Levantar el servidor con NPM
primero hay que instalar las dependencias
```
npm i
```
luego iniciar el servidor 
```
npm run dev
```
El frontend no debería de correr de por sí en docker, sino que hay que realizar un Build que se encarga de transformar todo el proyecto en algo que los navegadores puedan entender.
Luego del Build nos queda una carpeta llamada dist la cual es la que utilizan servidores como Nginx para distribuir nuestro proyecto a los navegadores.