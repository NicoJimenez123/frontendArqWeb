<template>
  <div>
    <div class="login">
      <label for="usuarioInput"></label>
      <InputText :value="usuario" id='usuarioInput'></InputText>
      <label for="passInput"></label>
      <InputText :value="password" id='passInput'></InputText>
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

const usuario = ref(null)
const password = ref(null)

const onLogin = async () => {
  let response = api.post('/login', {
    usuario: usuario.value,
    password: password.value
  })
  if(response.data) {
    isLogged.value = true
  }
}
const onRegister = async () => {
  let response = api.post('/register', {
    usuario: usuario.value,
    password: password.value
  })
  if(response.data) {
    isLogged.value = true
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