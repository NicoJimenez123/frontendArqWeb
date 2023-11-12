<template>
  <div class="admin">
    <Dialog
      v-model:visible="isDialogoVisible"
      :header="getHeaderDialogo"
      @after-hide="onOcultarDialogo"
      modal
      maximizable
    >
      <section style="display: flex;">
        <div style="display: flex;">
          <h3 style="margin-right: 2em; width: 25%;">Ingresar Nombre</h3>
          <InputText 
            :placeholder="'Nombre'"
            v-model:model-value="moduloNombre"
          />
        </div>
        <br>
        <div style="display: flex;">
          <h3 style="margin-right: 2em; width: 25%;">Ingresar Descripción</h3>
          <InputText 
            :placeholder="'Descripción'"
            v-model:model-value="moduloDescripcion"
          />
        </div>
        <br>
        <Button 
          style="margin-top: 2em;"
          :label="getHeaderDialogo"
          @click="onClickButtonDialog"
        />
      </section>
    </Dialog>
    <ContextMenu ref="contextMenu" :model="opcionesMenu" />
    <TablaDinamica 
      v-model:value="modulosDisponibles"
      :headers="listadoDeColumnas"
      v-model:filtros="filtros"
      :obtener-value="getModulos"
      v-model:fila-seleccionada="moduloSeleccionado"
      @onRowContextMenu="onRowContextMenu"
    >
      <template v-slot:header>
        <Button :label="'Añadir Recurso'" @click="toogleDialogo" />
      </template>
    </TablaDinamica>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import TablaDinamica from '@/components/admin/TablaDinamica.vue';
import { errorHandler } from '@/funciones/general/errorHandler';
import { construirAdaptador } from '@/funciones/general/adaptadorAPI';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';

const api = construirAdaptador('admin')
const toast = useToast()

const modulosDisponibles = ref()
const moduloSeleccionado = ref()
const listadoDeColumnas = [
  {field: 'id', header: 'ID del Módulo'},
  {field: 'nombre', header: 'Nombre'},
  {field: 'descripcion', header: 'Descripción'},
]
const filtros = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  id: { value: null, matchMode: FilterMatchMode.CONTAINS },
  nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
  descripcion: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// Context Menu
const contextMenu = ref()
const opcionesMenu = ref([
  {label: 'Editar Modulo', icon: 'pi pi-pencil', command: () => editarModulo()},
  {label: 'Eliminar Modulo', icon: 'pi pi-pencil', command: () => eliminarModulo()},
])

const onRowContextMenu = (event) => {
  contextMenu.value.show(event.originalEvent)
}

// Dialogo
const isDialogoVisible = ref(false)
const hayQueEditarModulo = ref(false)

const toogleDialogo = () => { 
  if(!hayQueEditarModulo.value) {
    limpiarInputs()
    isDialogoVisible.value = !isDialogoVisible.value 
  } else {
    isDialogoVisible.value = !isDialogoVisible.value 
  }
}

const getHeaderDialogo = computed(() => {
  return hayQueEditarModulo.value ? 'Editar Modulo' : ' Añadir Modulo' 
})

const onOcultarDialogo = () => {
  hayQueEditarModulo.value = false
}

const onClickButtonDialog = () => {
  hayQueEditarModulo.value ? actualizarModulo() : crearModulo()
}

// Llamadas a la API y variables
const moduloNombre = ref()
const moduloDescripcion = ref()

const limpiarInputs = () => {
  moduloNombre.value = null
  moduloDescripcion.value = null
}

const actualizarModulo = async () => {
  await putModulo(moduloSeleccionado.value.id, moduloNombre.value, moduloDescripcion.value)
  await getModulos()
  limpiarInputs()
  toogleDialogo()
}

const crearModulo = async () => {
  await postModulo(moduloNombre.value, moduloDescripcion.value)
  await getModulos()
  limpiarInputs()
  toogleDialogo()
}

const editarModulo = async () => {
  hayQueEditarModulo.value = true
  moduloNombre.value = moduloSeleccionado.value?.nombre
  moduloDescripcion.value = moduloSeleccionado.value?.descripcion
  toogleDialogo()  
}

const eliminarModulo = async () => {
  await deleteModulo(moduloSeleccionado.value.id)
  await getModulos()
}

const getModulos = async () => {
  modulosDisponibles.value = []
  await api.get('/modulo')
    .then(r => {
      modulosDisponibles.value = r.data?.modulos
      mostrarMensaje(toastSeverity.success, 'Éxito', 'Obtenido Listado de Módulos')
    })
    .catch(e => errorHandler(e))
}

const postModulo = async (moduloNombre, moduloDescripcion) => {
  await api.post('/modulo', {
    nombre: moduloNombre,
    descripcion: moduloDescripcion
  })
    .then(r => {
      mostrarMensaje(toastSeverity.success, 'Éxito', r.data.mensaje)
    })
    .catch(e => errorHandler(e))
}

const putModulo = async (id, moduloNombre, moduloDescripcion) => {
  await api.put('/modulo/' + id, {
    nombre: moduloNombre,
    descripcion: moduloDescripcion
  })
    .then(r => {
      mostrarMensaje(toastSeverity.success, 'Éxito', r.data.mensaje)
    })
    .catch(e => errorHandler(e))
}

const deleteModulo = async (id) => {
  await api.delete('/modulo/' + id)
    .then(r => {
      mostrarMensaje(toastSeverity.success, 'Éxito', r.data.mensaje)
    })
    .catch(e => errorHandler(e))
}

// Toast
const toastSeverity = {
  error: 'error',
  success: 'success',
  info: 'info',
  warn: 'warn',
}

const mostrarMensaje = (severity, titulo, detalle) => {
  toast.add({ severity: severity, summary: titulo, detail: detalle, life: 3000 });
}

onBeforeMount(() => {
  getModulos()
})
</script>

<style>

</style>