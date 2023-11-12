<template>
  <div class="admin">
    <TablaDinamica 
      v-model:value="permisosDisponibles"
      :headers="listadoDeColumnas"
      :filtros="filtros"
      :obtenerValue="getPermisos"
      v-model:fila-seleccionada="permisoSeleccionado"
      @onRowContextMenu="onRowContextMenu"
    />
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { construirAdaptador } from '@/funciones/general/adaptadorAPI';
import { errorHandler } from '@/funciones/general/errorHandler';
import { FilterMatchMode } from 'primevue/api';
import TablaDinamica from '@/components/admin/TablaDinamica.vue'
import { useToast } from 'primevue/usetoast';

const toast = useToast()
const api = construirAdaptador('admin')
const toastSeverity = {
  error: 'error',
  success: 'success',
  info: 'info',
  warn: 'warn',
}

const permisosDisponibles = ref()
const permisoSeleccionado = ref()

const listadoDeColumnas = [
  {field: 'id', header: 'ID'},
  {field: 'metodo', header: 'Nombre'},
]

const getPermisos = async () => {
  permisosDisponibles.value = []
  await api.get('/permiso')
    .then(r => {
      permisosDisponibles.value = r.data?.permiso
      mostrarMensaje(toastSeverity.success, 'Éxito', 'Permisos Obtenidos')
    })
    .catch(err => errorHandler(err))
}

const filtros = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  id: { value: null, matchMode: FilterMatchMode.CONTAINS },
  metodo: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

onBeforeMount(() => {
  getPermisos()
})

const onRowContextMenu = () => {
  return true
}

const mostrarMensaje = (severity, titulo, detalle) => {
  toast.add({ severity: severity, summary: titulo, detail: detalle, life: 3000 });
}
</script>

<style>

</style>