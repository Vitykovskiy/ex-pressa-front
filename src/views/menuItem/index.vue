<template>
    <div class="card">
        <div class="card__header">
            <h2>{{ item?.name }}</h2>
            <!--   <p>{{ description }}</p> -->
            <h3>{{ price + " ₽" }}</h3>
        </div>
        <v-divider />

        <template v-if="sizes?.length">
            <div class="card__body">
                <div class="card__size-container">
                    <v-btn-toggle v-model="sizeSelector" color="primary" mandatory>
                        <v-btn v-for="{ size } of sizes" variant="outlined" :ripple="false">{{ size }}</v-btn>
                    </v-btn-toggle>
                </div>
            </div>
            <v-divider />
        </template>

        <template v-if="optionsGroup?.items">
            <div class="card__body">
                <h3>Добавить</h3>
                <div class="card__size-container">
                    <v-btn-toggle v-model="selectedDrinkSize" color="primary" multiple>
                        <v-btn v-for="option in optionsGroup.items" variant="outlined" :ripple="false">
                            {{ option }}
                        </v-btn>
                    </v-btn-toggle>
                </div>
            </div>
            <v-divider />
        </template>

        <div class="card__body">
            <div class="card__size-container">
                <v-btn-toggle>
                    <v-btn variant="outlined" icon="mdi-minus" :ripple="false" @click="() => countComputed--" />
                    <v-btn variant="outlined" :ripple="false">{{ countComputed }}</v-btn>
                    <v-btn variant="outlined" icon="mdi-plus" :ripple="false" @click="() => countComputed++" />
                </v-btn-toggle>
                <v-btn height="48" color="primary" :ripple="false" @click="onAdd">Добавить</v-btn>
            </div>
        </div>

    </div>
</template>

<script lang="ts" setup>
import { useMenu } from '@/composables/useMenu';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { isDrinkItem, type AnyMenuGroup, type DrinkSizeVariant, type MenuItem, type OptionsGroup, } from '../menu/types';
import { useCart } from '@/composables/useCart';
import router from '@/router';

const route = useRoute()
const { menu, options } = useMenu()
const { addToCart } = useCart()

const count = ref(1)
const sizeSelector = ref<number>(1)
const selectedDrinkSize = computed<DrinkSizeVariant | null>(() => sizes.value?.[sizeSelector.value] ?? null)

const countComputed = computed({
    get() { return count.value },
    set(value) { count.value = value && value <= 10 ? value : count.value }
})

const group = computed<AnyMenuGroup | null>(() => {
    const { group: groupId } = route.params
    return menu.value.find((item) => item.id === Number(groupId)) || null
})

const optionsGroup = computed<OptionsGroup | null>(() => {
    const optionId = group.value?.optionsId
    return options.value.find((item) => item.id === Number(optionId)) || null
})

const item = computed<MenuItem | null>(() => {
    const { group: groupId, item: itemId } = route.params
    const group = menu.value.find((item) => item.id === Number(groupId))
    return group?.items.find((item) => item.id === Number(itemId)) || null
})

const sizes = computed<DrinkSizeVariant[] | null>(() =>
    isDrinkItem(item.value) ? item.value.sizes : null
)

const price = computed(() => {
    if (!item.value) return 0
    const basePrice = isDrinkItem(item.value) ? selectedDrinkSize.value?.price : item.value?.price
    return basePrice ? basePrice * count.value : 0
})

function onAdd(): void {
    const item = {}

    addToCart(item)
    router.back()
}

</script>

<style lang="scss">
.card {
    display: flex;
    flex-direction: column;
    margin: 0 20px;
    gap: 15px;

    &__header {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    &__body {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    &__size-container {
        display: flex;
        justify-content: center;
        gap: 10px;
    }
}
</style>