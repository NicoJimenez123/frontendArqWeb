<template>
  <div id="TablaDinamica">
    <DataTable
      v-bind:value="localValue"
      responsiveLayout
      removableSort
      v-model:filters="localFiltros"
      filterDisplay="row"
      paginator
      :rows="10"
      :globalFilterFields="localValue.value?.map(c => c.field)"
      v-model:contextMenuSelection="localFilaSeleccionada"
      @row-contextmenu="llamarRowSelected"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords}"
      v-model:selection="localFilaSeleccionada"
      selectionMode="single"
      :meta-key-selection="false"
    >
      <template #paginatorstart>
        <Button type="button" icon="pi pi-refresh" @click="props.obtenerValue" v-tooltip="'Recargar'"/>
      </template>
      
      <template #paginatorend>
        <div></div>
      </template>

      <template #header>
        <div style="display: flex;">
          <div class="justify-content-start" style="margin-right: auto;">
            <slot name="header"></slot>
          </div>
          <div class="justify-content-end" style="margin-left: auto;">
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <InputText v-model="localFiltros['global'].value" placeholder="Buscar" />
            </span>
          </div>
        </div>
      </template>
      <Column
        v-for="col, idx in props.headers"
        :header="col.header"
        :field="col.field"
        :key="idx"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data }">
          {{ data[col.field] }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" :placeholder="'Buscar ' + col.header" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, defineProps, watch, defineEmits } from 'vue';

const props = defineProps({
  value: {
    type: Object,
    required: true,
    default: []
  },
  headers: {
    type: [Array, null],
    required: true,
    default: []
  },
  filtros: {
    type: [Object, null]
  },
  obtenerValue: {
    type: [Function, null]
  },
  filaSeleccionada: {
    type: [Object, null]
  },
})

const localValue = ref(props.value)
const localFiltros = ref(props.filtros)
const localFilaSeleccionada = ref(props.filaSeleccionada)

const emit = defineEmits(['update:filaSeleccionada', 'onRowContextMenu'])

watch(() => props.value, (nuevoValor) => {
  localValue.value = nuevoValor 
})

watch(() => localFilaSeleccionada.value, (nuevoValor) => {
  emit('update:filaSeleccionada', nuevoValor)
})

const llamarRowSelected = (e) => {
  emit('onRowContextMenu', e)
}
</script>

<style>
</style>