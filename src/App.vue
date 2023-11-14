<template>
  <div>
    <div class="login" v-if="!isLogged">
      <label for="usuarioInput"></label>
      <InputText v-model="usuario" id='usuarioInput'></InputText>
      <label for="passInput"></label>
      <InputText v-model="password" id='passInput'></InputText>
      <Button @click="onLogin">Iniciar Sesión</Button>
      <Button @click="onRegister">Registrarse</Button>
    </div>
    <div v-if="isLogged">
      <nav>
        <RouterLink to="/usuarios">Usuarios</RouterLink>
        <RouterLink to="/roles">Roles</RouterLink>
        <RouterLink to="/recursos">Recursos</RouterLink>
      </nav>
      <RouterView></RouterView>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { construirAdaptador } from './funciones/general/adaptadorAPI'

const api = construirAdaptador()
const isLogged = ref(false)

const usuario = ref()
const password = ref()

const onLogin = async () => {
  let response = await api.post('/usuarios/login', {
    username: usuario.value,
    password: password.value
  })
  if(response.data.token) {
    isLogged.value = true
    localStorage.setItem('token', response.data.token)
  }
}
const onRegister = async () => {
  let response = await api.post('/usuarios/register', {
    username: usuario.value,
    password: password.value
  })
  if(response.data){
    alert('Usuario Registrado, ya puede loguearse')
  } else {
    alert('Error al registrar')
  }
}
</script>

<style>
body {
  background-color: darkgray;
}
nav {
  background-color: white;
  margin-bottom: 2rem;
}

a {
  margin-right: 10px;
}
</style>