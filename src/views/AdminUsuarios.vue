<template>
  <div class="admin">
    <ContextMenu ref="contextMenuRol" :model="menuRoles" />
    <Dialog v-model:visible="isDialogVisible" maximizable modal :header="'Asignar Rol'" :style="{width: '60vw'}">
      <h3>Asignar Rol al Usuario {{ obtenerUsuarioSeleccionado() }}</h3>
      <br>
      <Dropdown
        v-model:modelValue="rolParaAsignar"
        :options="listadoRoles"
        :optionLabel="'nombre'"
        :placeholder="'Seleccionar Rol'"
      />
      <Button
        :label="'Asignar Rol'"
        @click="asignarRol"
      />
      <TablaDinamica 
        :value="rolesUsuario"
        :headers="listadoDeColumnasRol"
        :filtros="filtrosRoles"
        :obtenerValue="obtenerRolesUsuarioSeleccionado"
        @onRowContextMenu="onRowContextmenuRoles"
        v-model:filaSeleccionada="rolSeleccionado"
      />
    </Dialog>
    <Dialog
      v-model:visible="isDialogoUsuarioVisible"
      :header="getHeaderDialogoUsuario"
      @after-hide="onOcultarDialogoUsuario"
      modal
      maximizable
    >
      <section style="display: block;">
        <div style="display: flex;" v-for="prop, idx in UsuarioProps" :key="idx">
          <InputText 
            :placeholder="prop.label"
            v-model:model-value="prop.value"
          />
        </div>
        <br>
        <Button 
          style="margin-top: 2em;"
          :label="getHeaderDialogoUsuario"
          @click="onClickButtonDialog"
        />
      </section>
    </Dialog>
    <ContextMenu ref="cm" :model="menuModel" />
    <TablaDinamica 
      :value="listadoUsuarios"
      :headers="listadoDeColumnas"
      :filtros="filters"
      :obtenerValue="getUsuarios"
      @onRowContextMenu="onRowContextmenu"
      v-model:filaSeleccionada="filaSeleccionada"
    >
      <template v-slot:header>
        <Button label="Añadir Usuario" @click="toogleDialogo"></Button>
      </template>
    </TablaDinamica>
  </div>
</template>

<script setup>
import { errorHandler } from '@/funciones/general/errorHandler';
import { FilterMatchMode } from 'primevue/api';
import { onBeforeMount, ref, computed, onMounted } from 'vue';
import TablaDinamica from '@/components/admin/TablaDinamica.vue'
import { useToast } from 'primevue/usetoast';
import { toastSeverity } from './toastSeverity';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button'
import { construirAdaptador } from '@/funciones/general/adaptadorAPI';

const api = construirAdaptador('')
const toast = useToast()

const listadoUsuarios = ref([])
const listadoRoles = ref([])
const rolesUsuario = ref(null)
const isDialogVisible = ref(false)
const cm = ref()
const filaSeleccionada = ref(null)
const isDialogoUsuarioVisible = ref(false)
const hayQueEditarUsuario = ref(false)
const rolSeleccionado = ref(null)
const contextMenuRol = ref(null)
const rolParaAsignar = ref(null)

const listadoDeColumnasRol = [
  {field: "_id", header: "ID relación rol-usuario"},
  {field: "nombre", header: "Nombre del Rol"},
]

const menuRoles = ref([
  {label: 'Eliminar Rol', icon: 'pi pi-fw pi-search', command: () => eliminarRol()},
])

const filtrosRoles = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    _id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const listadoDeColumnas = [
  {field: '_id', header: 'ID'},
  {field: 'usuario_nombre', header: 'Nombre de Usuario'},
  {field: 'fechaCreacion', header: 'Fecha de Creacion'},
  {field: 'fechaModificacion', header: 'Fecha de Modificacion'},
]

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    _id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    usuario_nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
    fechaCreacion: { value: null, matchMode: FilterMatchMode.CONTAINS },
    fechaModificacion: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const menuModel = ref([
  {label: 'Editar Usuario', icon: 'pi pi-fw pi-search', command: () => toogleEditarUsuario()},
  {label: 'Eliminar Usuario', icon: 'pi pi-fw pi-search', command: () => eliminarUsuario()},
  {label: 'Administrar Roles', icon: 'pi pi-fw pi-search', command: () => mostrarRoles(filaSeleccionada)},
])

const onRowContextmenu = (event) => {
  cm.value.show(event.originalEvent)
}
const mostrarRoles = (r) => {
  isDialogVisible.value = true
  getRolUsuarioID(r.value?._id)
}

// Usuarios
const UsuarioProps = ref([
  {label: 'usuario_nombre', value: null},
  {label: 'contraseña', value: null},
])

const getHeaderDialogoUsuario = computed( () => {
  return hayQueEditarUsuario.value ? 'Editar Usuario' : 'Añadir Usuario' 
})

const toogleDialogo = () => {
  isDialogoUsuarioVisible.value = !isDialogoUsuarioVisible.value
}

const onOcultarDialogoUsuario = () => {
  limpiarUsuarioProps()
}

const onClickButtonDialog = () => {
  hayQueEditarUsuario.value ? editarUsuario() : crearUsuario()
}

const limpiarUsuarioProps = () => {
  UsuarioProps.value = [
    {label: 'usuario_nombre', value: null},
    {label: 'contraseña', value: null},
  ]
}

const toogleEditarUsuario = () => {
  hayQueEditarUsuario.value = true
  UsuarioProps.value = [
    {label: 'usuario_nombre', value: filaSeleccionada.value.usuario_nombre},
  ]
  toogleDialogo()
}

const crearUsuario = async () => {
  let username = UsuarioProps.value.find(p => p.label == 'usuario_nombre')
  let password = UsuarioProps.value.find(p => p.label == 'contraseña')
  await postUsuarios(username, password)
  await getUsuarios()
  limpiarUsuarioProps()
  toogleDialogo()
}

const editarUsuario = async () => {
  let username = UsuarioProps.value.find(p => p.label == 'usuario_nombre')?.value
  await putUsuarios( filaSeleccionada.value._id, username)
  await getUsuarios()
  limpiarUsuarioProps()
  toogleDialogo()
}

const eliminarUsuario = async () => {
  await deleteUsuarios(filaSeleccionada.value._id)
  await getUsuarios()
}

const eliminarRol = async () => {
  const mensaje = `¿Eliminar Rol ${rolSeleccionado.value.nombre} del Usuario ${filaSeleccionada.value.nombre}?`
  let eliminar = confirm(mensaje)
  if(eliminar) {
    await deleteUsuarioRol(rolSeleccionado.value._id)
    rolSeleccionado.value = []
    obtenerRolesUsuarioSeleccionado()
  } else {
    // No hago nada
  }
}

const asignarRol = async () => {
  if(rolParaAsignar.value) {
    await postAsignarRol(filaSeleccionada.value._id, rolParaAsignar.value._id)
    obtenerRolesUsuarioSeleccionado()
  } else {
    mostrarMensaje(toastSeverity.warn, 'Mal', 'Debe seleccionar un Rol')
  }
}

const onRowContextmenuRoles = (event) => {
  contextMenuRol.value.show(event.originalEvent)
}

const obtenerRolesUsuarioSeleccionado = () => {
  getRolUsuarioID(filaSeleccionada.value._id)
}

const mostrarMensaje = (severity, titulo, detalle) => {
  toast.add({ severity: severity, summary: titulo, detail: detalle, life: 3000 });
}

const obtenerUsuarioSeleccionado = () => {
  return filaSeleccionada?.value?.username || 'Ningún Usuario Seleccionado' 
}

// Llamadas a la API
const getUsuarios = async () => {
  listadoUsuarios.value = []
  await api.get('/usuarios')
    .then(r => {
      return listadoUsuarios.value = r.data
    })
    .catch(err => errorHandler(err))
}

const postUsuarios = async (username, password) => {
  await api.post('/usuarios', {
    usuario: username.value,
    pass: password.value
  })
    .then(r => mostrarMensaje(toastSeverity.success, 'Éxito', r.data.mensaje))
    .catch(e => errorHandler(e))
}

const putUsuarios = async (_id, username) => {
  await api.put('/usuarios/' + _id, {
    username
  })
    .then(r => mostrarMensaje(toastSeverity.success, 'Éxito', r.data.mensaje))
    .catch(e => errorHandler(e))
}

const deleteUsuarios = async (id) => {
  await api.delete('/usuarios/' + id)
    .then(r => mostrarMensaje(toastSeverity.success, 'Éxito', r.data.mensaje))
    .catch(e => errorHandler(e))
}

const getRoles = async () => {
  listadoRoles.value = []
  await api.get('/roles')
    .then(r => listadoRoles.value = r.data?.roles)
    .catch(err => errorHandler(err))
}

const getRolUsuarioID = async (usuarioID) => {
  rolesUsuario.value = []
  await api.get('/usuarioRol/usuario/' + usuarioID)
    .then(r => rolesUsuario.value = r.data?.roles)
    .catch(e => errorHandler(e))
}

const deleteUsuarioRol = async (usuarioRolID) => {
  await api.delete('/usuarioRol/' + usuarioRolID)
    .then(r => mostrarMensaje(toastSeverity.success, 'Bien', r.data.mensaje))
    .catch(e => errorHandler(e))
}

const postAsignarRol = async (usuario_id, rol_id) => {
  await api.post('/usuarioRol/', {
    usuario_id,
    rol_id
  })
    .then(r => mostrarMensaje(toastSeverity.success, 'Bien', r.data.mensaje))
    .catch(e => {
      if(e.response.status == 422) {
        mostrarMensaje(toastSeverity.error, 'Error', e.response.data.mensaje)
      }
    })
}

onBeforeMount(() => {
  getUsuarios()
  getRoles()
})
</script>

<style>

</style>