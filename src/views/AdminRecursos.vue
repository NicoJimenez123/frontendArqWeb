<template>
  <div class="admin">
    <Dialog
      v-model:visible="isDialogoVisible"
      maximizable
      modal
      :header="'Formulario para Recursos'"
      style="width: 80vw;"
      @after-hide="onOcultarDialogo"
      
    >
      <section style="{display: flex}">
        <h2>{{obtenerHeaderDialogo}}</h2>
        <br>
        <div style="display: flex;">
          <h3 style="margin-right: 2em; width: 25%">Seleccionar Modulo</h3>
          <Dropdown
            style="width: 60%;"
            id="DropdownSeleccionarModulo"
            placeholder="Seleccionar Modulo"
            :options="modulos"
            :option-label="'nombre'"
            v-model:model-value="moduloSeleccionado"
          />
        </div>
        <br>
        <div style="display: flex;">
          <h3 style="margin-right: 2em; width: 25%;">URL Base</h3>
          <InputText 
            :placeholder="obtenerURLBase()"
            :disabled="true"
          />
        </div>
        <br>
        <div style="display: flex;">
          <h3 style="margin-right: 2em; width: 25%;">Ingresar URL</h3>
          <InputText 
            :placeholder="'Ingresar URL del Recurso'"
            v-model:model-value="urlRecursoAniadir"
          />
        </div>
        <Button 
          style="margin-top: 2em;"
          :label="obtenerHeaderDialogo"
          @click="onClickButtonDialog"
        />
        <div style="margin-bottom: 1em;"></div>
      </section>
    </Dialog>
    <ContextMenu ref="contextMenu" :model="opcionesMenu" />
    <TablaDinamica
      v-model:value="recursos"
      :headers="listadoDeColumnas"
      v-model:filtros="filtrosRecursos"
      :obtener-value="getRecursos"
      v-model:fila-seleccionada="recursoSeleccionado"
      @onRowContextMenu="onRowContextMenu"
    >
      <template v-slot:header>
        <Button :label="'Añadir Recurso'" @click="toogleDialogo"/>
      </template>
    </TablaDinamica>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import { construirAdaptador } from '@/funciones/general/adaptadorAPI';
import { FilterMatchMode } from 'primevue/api';
import TablaDinamica from '@/components/admin/TablaDinamica.vue';
import { errorHandler } from '@/funciones/general/errorHandler';
import Dropdown from 'primevue/dropdown';
import { useToast } from 'primevue/usetoast';

const api = construirAdaptador('admin')
const toast = useToast()

// Recursos
const recursos = ref()
const urlRecursoAniadir = ref('')
const listadoDeColumnas = [
  {field: 'id', header: 'ID del Recurso'},
  {field: 'url', header: 'URL del Recurso'},
  {field: 'modulo_id', header: 'ID del Modulo'},
  {field: 'modulo', header: 'Nombre del Modulo'},
]

const filtrosRecursos = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  id: { value: null, matchMode: FilterMatchMode.CONTAINS },
  url: { value: null, matchMode: FilterMatchMode.CONTAINS },
  modulo_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
  modulo: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const recursoSeleccionado = ref()

const getRecursos = async () => {

  await api.get('/recurso') 
    .then(r => {
      mostrarMensaje(toastSeverity.success, 'Éxito', 'Recursos obtenidos con éxito.')
      recursos.value = r.data.recursos
    })
    .catch(e => errorHandler(e))
}

const postRecurso = async (url, modulo) => {
  modulo = JSON.parse(JSON.stringify(modulo))
  await api.post('/recurso', {
    url,
    modulo
  })
    .then(r => {
      mostrarMensaje(toastSeverity.success, 'Éxito', r.data.mensaje)
    })
    .catch(e => errorHandler(e))
}

const deleteRecurso = async (recurso_id) => {
  await api.delete('/recurso/'+ recurso_id)
    .then(r => {
      mostrarMensaje(toastSeverity.success, 'Éxito', r.data.mensaje)
    })
    .catch(e => errorHandler(e))
}

const updateRecurso = async (recurso_id, nuevaURL, modulo_id, modulo_nombre) => {
  await api.put('/recurso/'+ recurso_id, {
    url: nuevaURL,
    modulo_id,
    modulo: modulo_nombre
  })
    .then(r => {
      mostrarMensaje(toastSeverity.success, 'Éxito', r.data.mensaje)
    })
    .catch(e => errorHandler(e))
}

const aniadirRecurso = async () => {
  // La URL del recurso es válida
  await postRecurso(obtenerURLBase() + urlRecursoAniadir.value, moduloSeleccionado.value)
  getRecursos()
  toogleDialogo()
}

const validateUrl = (url) => {
  return /^\/[^/]+(\/[^/]+)*$/.test(url);
};

// Modulos
const modulos = ref()
const moduloSeleccionado = ref()

const getModulos = async () => {
  await api.get('/modulo')
    .then(r => modulos.value = r.data.modulos)
    .catch(e => errorHandler(e))
}

const obtenerURLBase = () => {
  return moduloSeleccionado.value ? `${moduloSeleccionado.value.nombre}` : '/'
}

// Context Menu
const contextMenu = ref()
const opcionesMenu = ref([
  {label: 'Editar Recurso', icon: 'pi pi-pencil', command: () => editarRecurso()},
  {label: 'Eliminar Recurso', icon: 'pi pi-times-circle', command: () => eliminarRecurso()},
])

const editarRecurso = async () => {
  // Acá indico que voy a editar un recurso para que se cambie el header del Dialog
  hayQueEditarRecurso.value = true
  // Obtengo la URL del recurso seleccionado y la convierto en array separandola por la /
  let arrayRecurso = recursoSeleccionado.value.url.split('/')
  // Elimino el primer elemento que corresponde al nombre del módulo y de paso, lo selecciono en el combo de módulo
  let moduloPerteneciente = arrayRecurso.shift()
  moduloSeleccionado.value = modulos.value.find(m => m.nombre == moduloPerteneciente)  
  // Junto los elementos sobrantes que corresponden a la URL del recurso
  urlRecursoAniadir.value = arrayRecurso.join('/')
  // Añado la / al inicio porque es obligatoria en las URLs 
  urlRecursoAniadir.value = '/' + urlRecursoAniadir.value
  // MUestro el Dialog
  toogleDialogo()
}

const onEditarRecurso = async () => {
  let url = moduloSeleccionado.value.nombre + urlRecursoAniadir.value
  await updateRecurso(recursoSeleccionado.value.id, url, moduloSeleccionado.value.id, moduloSeleccionado.value.nombre)
  getRecursos()
  toogleDialogo()
}

const eliminarRecurso = async () => {
  await deleteRecurso(recursoSeleccionado.value.id)
  getRecursos()
}

const onRowContextMenu = (event) => {
  contextMenu.value.show(event.originalEvent)
}

// Dialogp
const isDialogoVisible = ref(false)
const hayQueEditarRecurso = ref(false)

const toogleDialogo = () => {
  if(!hayQueEditarRecurso.value) {
    recursoSeleccionado.value = null
    moduloSeleccionado.value = null
    urlRecursoAniadir.value = null
    isDialogoVisible.value = !isDialogoVisible.value
  } else {
    isDialogoVisible.value = !isDialogoVisible.value
  }
}

const obtenerHeaderDialogo = computed(() => {
  return hayQueEditarRecurso.value ? 'Editar Recurso' : 'Añadir Recurso'
})

const onOcultarDialogo = () => {
  hayQueEditarRecurso.value = false
}

const onClickButtonDialog = () => {
  if(validateUrl(urlRecursoAniadir.value) && moduloSeleccionado.value) {
    // La URL del recurso es válida
    hayQueEditarRecurso.value ? onEditarRecurso() : aniadirRecurso()
  } else {
    if(!validateUrl(urlRecursoAniadir.value)){
      mostrarMensaje(toastSeverity.warn, 'Error', 'La URL Ingresada no es válida')
    }
    else if(!moduloSeleccionado.value) {
      mostrarMensaje(toastSeverity.warn, 'Error', 'Modulo no seleccionado')
    }
  }
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
  getRecursos()
  getModulos()
})
</script>

<style>

</style>