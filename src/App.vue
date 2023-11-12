<template>
  <div>
    <RouterLink to="/usuarios">Usuarios</RouterLink>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from 'vue-router'
import Column from "primevue/column";
import DataTable from "primevue/datatable";

const router = useRouter()

const seleccionarVista = (event) => {
  let vista = JSON.parse(JSON.stringify(event.data))
  router.push({
    name: vista.name,
  })
}
const informacionDePantallas = ref([])
</script>

<style>
</style>