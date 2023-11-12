<template>
  <div>
    <nav>
      <RouterLink to="/usuarios">Usuarios</RouterLink>
      <RouterLink to="/roles">Roles</RouterLink>
      <RouterLink to="/recursos">Recursos</RouterLink>
      <RouterLink to="/permisos">Permisos</RouterLink>
      <RouterLink to="/modulos">Modulos</RouterLink>
    </nav>
    <RouterView></RouterView>
  </div>
</template>

<script setup>
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