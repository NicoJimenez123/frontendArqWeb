<template>
  <div id="socd">
    <DataTable
      :value="informacionDePantallas"
      responsiveLayout="scroll"
      showGridlines
      dataKey="label"
      @rowSelect="seleccionarVista"
      selectionMode="single"
      stripedRows
    >
      <template #header>
        <h2><b>Descripción de las Pantallas</b></h2>
      </template>
      <Column field="label" header="Nombre">
        <template #body="slotProps">
          <router-link :to="'/usuarios'">
            <p>Usuarios</p>
          </router-link>
        </template>
      </Column>
    </DataTable>
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