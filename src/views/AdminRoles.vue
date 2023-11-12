<template>
  <div class="admin">
    <Dialog
      v-model:visible="isDialogoAniadirVisible"
      maximizable
      modal
      :header="getHeaderDialogoRol"
      style="width: 80vw;"
      @after-hide="onOcultarDialogoAniadir"
    >
      <section style="display: flex;">
        <div style="display: flex;">
          <h3 style="margin-right: 2em; width: 25%;">Ingresar Nombre</h3>
          <InputText 
            :placeholder="'Nombre'"
            v-model:model-value="rolNombre"
          />
        </div>
        <br>
        <Button 
          style="margin-top: 2em;"
          :label="getHeaderDialogoRol"
          @click="onClickButtonDialog"
        />
      </section>
    </Dialog>

    <Dialog
      v-model:visible="isDialogoRolVisible"
      maximizable
      modal
      :header="obtenerHeaderDialogoRol()"
      style="width: 80vw;"
      @after-hide="onOcultarDialogoRol"
    >
      <Dropdown
        v-model:model-value="moduloSeleccionado"
        :options="modulosDisponibles"
        :optionLabel="'nombre'"
        placeholder="Seleccionar Módulo"
      />
      <Dropdown
        v-model:model-value="recursoSeleccionado"
        :options="obtenerRecursosFiltrados"
        :optionLabel="'recursoMetodo'"
        placeholder="Seleccionar Recurso"
        style="height: 80%;"
      />
      <Button :label="'Añadir Recurso'" @click="aniadirRecursoRol"/>
      <ContextMenu ref="cmPermRol" :model="opcionesMenuPermisos" />
      <TablaDinamica
        style="margin-top: 1em;"
        v-model:value="permisosRolDisponibles"
        :headers="listadoColumnasPermisosRol"
        v-model:filtros="filtrosPermisosRol"
        :obtener-value="getPermisosRol"
        contextmenu="cmPermRol"
        v-model:fila-seleccionada="permisoRolSeleccionado"
        @onRowContextMenu="onRowContextMenuPermisoRol"
      >
      </TablaDinamica>
    </Dialog>
    <ContextMenu ref="cmRoles" :model="opcionesMenuRol" />
    <TablaDinamica
      v-model:value="rolesDisponibles"
      :headers="listadoColumnasRoles"
      v-model:filtros="filtrosRoles"
      :obtener-value="getRoles"
      contextmenu="cmRoles"
      v-model:fila-seleccionada="rolSeleccionado"
      @onRowContextMenu="onRowContextMenuRoles"
    >
      <template v-slot:header>
        <Button :label="'Añadir Rol'" @click="toogleDialogo"/>
      </template>
    </TablaDinamica>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, watch, computed } from 'vue'
import { construirAdaptador } from '@/funciones/general/adaptadorAPI';
import { useToast } from 'primevue/usetoast';
import { errorHandler } from '@/funciones/general/errorHandler';
import TablaDinamica from '@/components/admin/TablaDinamica.vue';
import { FilterMatchMode } from 'primevue/api';
import Dropdown from 'primevue/dropdown';

const api = construirAdaptador('admin')
const toast = useToast()

// ContextMenu
const cmRoles = ref()
const onRowContextMenuRoles = (event) => {
  cmRoles.value.show(event.originalEvent)
}

const cmPermRol = ref()
const onRowContextMenuPermisoRol = (event) => {
  cmPermRol.value.show(event.originalEvent)
}

const opcionesMenuRol = ref([
  {label: 'Editar Rol', icon: 'pi pi-pencil', command: () => editarRol()},
  {label: 'Eliminar Rol', icon: 'pi pi-times-circle', command: () => eliminarRol()},
  {label: 'Administrar Permisos', icon: 'pi pi-times-circle', command: () => administrarPermisos()},
])

const opcionesMenuPermisos = ref([
  {label: 'Eliminar Permiso', icon: 'pi pi-times-circle', command: () => eliminarPermisoRol()},
])

const administrarPermisos = () => {
  toogleDialogoRol()
}

// Tabla
const filtrosRoles = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  _id: { value: null, matchMode: FilterMatchMode.CONTAINS },
  rol_nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const filtrosPermisosRol = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  id: { value: null, matchMode: FilterMatchMode.CONTAINS },
  url: { value: null, matchMode: FilterMatchMode.CONTAINS },
  metodo: { value: null, matchMode: FilterMatchMode.CONTAINS },
  modulo: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// Dialog
const isDialogoAniadirVisible = ref(false)
const hayQueEditarRol = ref(false)
const getHeaderDialogoRol = computed(() => {
  return hayQueEditarRol.value ? 'Editar Rol' : 'Añadir Rol'
})

const toogleDialogo = () => {
  isDialogoAniadirVisible.value = !isDialogoAniadirVisible.value
}

const onOcultarDialogoAniadir = () => {
  limpiarInputs()
}

const onClickButtonDialog = () => {
  hayQueEditarRol.value ? actualizarRol() : crearRol()
}

const isDialogoRolVisible = ref(false)

const toogleDialogoRol = () => {
  isDialogoRolVisible.value = !isDialogoRolVisible.value
}

const obtenerHeaderDialogoRol = () => {
  return 'Agregar Permisos al Rol: ' + rolSeleccionado.value?.nombre
}

const onOcultarDialogoRol = () => {
  limpiarInputs()
}

const obtenerRecursosFiltrados = computed(() => {
  // Hay que arreglar el menú contextual que aparece para poner solo la opción de eliminar permiso
  // Habría que añadir un filter al dropdown para seleccionar recurso
  // Cuando se quiere añadir un recurso, hay que descomponer el objeto seleccionado para enviarlo como lo requiere la API de Autorizacion
  let recursos = []
  // Si hay un modulo seleccionado , primero filtro las URLs que se puedan seleccionar para que coincidan con dicho modulo 
  if(moduloSeleccionado.value) {
    recursos = mapearRecursosConPermisos.value?.filter(p => p.url.split('/')[0] == moduloSeleccionado.value.nombre)
  } else {
    recursos = mapearRecursosConPermisos?.value
  }
  // Recorro todo el Array con los recursos y permisos que se pueden seleccionar 
  let urlsFiltradas = recursos.filter(r => {
    // Busco cada recurso en el Array de los permisos que ya tiene el Rol seleccionado
    // Si el recurso + permiso se encuentra 1 o más veces, lo excluyo del listado de recursos para seleccionar
    let listaURLsEncontradas = permisosRolDisponibles.value?.filter(u => { 
      let comparacion = u.url.localeCompare(r.url) == 0 && u.metodo.localeCompare(r.metodo) == 0
      return comparacion
    })
    return listaURLsEncontradas?.length == 0
  })
  // Acá hago un mapeo para mostrar en el selector el string: ej, (GET) - admin/usuarios
  urlsFiltradas = urlsFiltradas.map(u => {return {...u, recursoMetodo: `(${u.metodo}) - ${u.url}`}})
  return urlsFiltradas
})

const mapearRecursosConPermisos = computed(() => {
  // Acá obtengo el listado de recursos que existen en la API y los mapeo a un objeto con las propiedades url y metodo (get, post, delete y put)
  let recursos = []
  recursosDisponibles.value?.forEach(r => {
    permisosDisponibles.value?.forEach(p => {
      recursos.push({url: r.url, metodo: p.metodo, recurso_id: r.id, permiso_id: p.id})
    })
  })
  return recursos
})

// Variables del Rol
const rolNombre = ref()
const rolDescripcion = ref()
const limpiarInputs = () => {
  rolNombre.value = ''
}

// Variables para la Tabla
const rolSeleccionado = ref()
const permisoRolSeleccionado = ref()
const moduloSeleccionado = ref()
const recursoSeleccionado = ref()

const listadoColumnasRoles = [
  {field: '_id', header: 'ID'},
  {field: 'rol_nombre', header: 'Nombre'},
]

const listadoColumnasPermisosRol = [
  {field: 'id', header: 'ID Permiso-Rol'},
  {field: 'url', header: 'URL'},
  {field: 'metodo', header: 'Método'},
  {field: 'modulo', header: 'Módulo'},
]

// Llamadas a la API y Variables
const rolesDisponibles = ref()
const modulosDisponibles = ref()
const recursosDisponibles = ref()
const permisosDisponibles = ref()
const permisosRolDisponibles = ref()

const getRoles = async () => {
  await api.get('/roles')
    .then(r => {
      rolesDisponibles.value = r.data.roles
    })
    .catch(e => errorHandler(e))
}

const getModulos = async () => {
  await api.get('/modulo')
    .then(r => {
      modulosDisponibles.value = r.data.modulos
    })
    .catch(e => errorHandler(e))
}

const getRecursos = async () => {
  await api.get('/recurso')
    .then(r => {
      recursosDisponibles.value = r.data.recursos
    })
    .catch(e => errorHandler(e))
}

const getPermisos = async () => {
  await api.get('/permiso')
    .then(r => {
      permisosDisponibles.value = r.data.permiso
    })
    .catch(e => errorHandler(e))
}

const getPermisosRol = async (rol_id) => {
  await api.get('/rolModuloRecursoPermiso/rol/'+rol_id+'/recurso')
    .then(r => {
      permisosRolDisponibles.value = r.data.recursos
    })
    .catch(e => errorHandler(e))
}

const deletePermisosRol = async (permisoRol_id) => {
  await api.get('/rolModuloRecursoPermiso/' + permisoRol_id)
    .then(r => {
      mostrarMensaje(toastSeverity.success, 'Éxito', r.data.mensaje)
    })
    .catch(e => errorHandler(e))
}

const postPermisosRol = async (modulo_id, recurso_id, rol_id, permiso_id) => {
  await api.post('/rolModuloRecursoPermiso', {
    modulo_id,
    recurso_id,
    rol_id,
    permiso_id
  })
    .then(() => {
      mostrarMensaje(toastSeverity.success, 'Éxito', 'Permiso Añadido con éxito.')
    })
    .catch(e => errorHandler(e))
}

const deleteRol = async (id) => {
  await api.delete('/roles/'+ id)
    .then(r => {
      mostrarMensaje(toastSeverity.success, 'Éxito', r.data.mensaje)
    })
    .catch(e => errorHandler(e))
}

const putRol = async (id, rol_nombre, rol_descripcion) => {
  await api.put('/roles/'+ id, {
    nombre: rol_nombre,
    descripcion: rol_descripcion
  })
    .then(r => {
      mostrarMensaje(toastSeverity.success, 'Éxito', r.data.mensaje)
    })
    .catch(e => errorHandler(e))
}

const postRol = async (rol_nombre, rol_descripcion) => {
  await api.post('/roles', {
    nombre: rol_nombre,
    descripcion: rol_descripcion
  })
    .then(r => mostrarMensaje(toastSeverity.success, 'Éxito', r.data.mensaje))
    .catch(e => errorHandler(e))
}

const aniadirRecursoRol = async () => {
  let valoresSeleccionados = moduloSeleccionado.value != null && recursoSeleccionado.value != null
  if(valoresSeleccionados) {
    await postPermisosRol(moduloSeleccionado.value._id, recursoSeleccionado.value.recurso_id, rolSeleccionado.value._id, recursoSeleccionado.value.permiso_id)
    getPermisosRol(rolSeleccionado.value?.id)
  } else {
    mostrarMensaje(toastSeverity.error, 'Error', 'Alguno de los valores no está seleccionado')
  }
}

const editarRol = async () => {
  hayQueEditarRol.value = true
  rolNombre.value = rolSeleccionado.value.nombre
  rolDescripcion.value = rolSeleccionado.value.descripcion
  toogleDialogo()
}

const actualizarRol = async () => {
  await putRol(rolSeleccionado.value._id, rolNombre.value, rolDescripcion.value)
  await getRoles()
  limpiarInputs()
  toogleDialogo()
}

const eliminarRol = async () => {
  await deleteRol(rolSeleccionado.value._id)
  await getRoles()
}

const crearRol = async () => {
  await postRol(rolNombre.value, rolDescripcion.value)
  await getRoles()
  toogleDialogo()
}

const eliminarPermisoRol = async () => {
  await deletePermisosRol(permisoRolSeleccionado.value._id)
  await getPermisosRol(rolSeleccionado.value._id)
}

watch(() => rolSeleccionado.value, () => {
  rolSeleccionado.value ? getPermisosRol(rolSeleccionado.value?.id) : false
})

onBeforeMount(() => {
  getRoles(),
  getModulos(),
  getRecursos(),
  getPermisos()
})

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

</script>

<style>

</style>