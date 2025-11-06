<template>
    <v-data-table hide-default-footer :items-per-page="-1" :items="cart" :headers="headers" hover
        no-data-text="Пока ничего не добавлено" @click:row="onRowClick">
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
import type { ItemSlotBase } from 'vuetify/lib/components/VDataTable/types.mjs';
import router from '@/router';
import { RouteNames } from '@/routes';
import type { ICartItem } from '@/composables/types';

const { cart } = useCart()

const headers = ref<DataTableHeader[]>(CART_TABLE_HEADERS)

function onRowClick(
    _event: MouseEvent,
    ctx: ItemSlotBase<ICartItem>
): void {
    const index = ctx.index
    const { id, groupId, name, selectedOptions, ...rest } = ctx.item;
    // Нужно вытащить id и parentId
    const selectedOptionsIds = selectedOptions?.map(({ }) => { })
    router.push({
        name: RouteNames.MenuItem,
        params: { group: groupId, item: id },
        query: { cartIndex: index, ...rest }
    })
}

</script>

<style lang="scss" scoped></style>