<template>
    <v-data-table hide-default-footer :items-per-page="-1" :items="items" :headers="headers" hover
        no-data-text="Пока ничего не добавлено">
        <template v-slot:header.item>
            <h2>Корзина</h2>
        </template>
    </v-data-table>
</template>

<script lang="ts" setup>
import { useCart } from '@/composables/useCart';
import { computed, ref } from 'vue';
import { CART_TABLE_HEADERS } from './constants';
import type { DataTableHeader } from 'vuetify';
const { cart } = useCart()

const items = computed(() => cart.value.map(() => ({ key: 'example' })))
const headers = ref<DataTableHeader[]>(CART_TABLE_HEADERS)
</script>

<style lang="scss" scoped></style>