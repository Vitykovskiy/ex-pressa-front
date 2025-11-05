<template>
    <v-data-table hide-default-footer :items-per-page="-1" :items="cart" :headers="headers" hover
        no-data-text="Пока ничего не добавлено">
        <template v-slot:header.item>
            <h2>Корзина</h2>
        </template>
        <template v-slot:item.item="{ item }">
            <CartRow :item="item" />
        </template>
    </v-data-table>
</template>

<script lang="ts" setup>
import { useCart } from '@/composables/useCart';
import CartRow from './cartRow/index.vue'
import { ref } from 'vue';
import { CART_TABLE_HEADERS } from './constants';
import type { DataTableHeader } from 'vuetify';

const { cart } = useCart()

const headers = ref<DataTableHeader[]>(CART_TABLE_HEADERS)
</script>

<style lang="scss" scoped></style>