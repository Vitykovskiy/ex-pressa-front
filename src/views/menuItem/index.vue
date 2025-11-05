<template>
    <div class="card">
        <div class="card__header">
            <h2>{{ item?.name }}</h2>
            <!--   <p>{{ description }}</p> -->
            <h3>{{ basePrice * quantity + " ₽" }}</h3>
        </div>
        <v-divider />

        <template v-if="sizes?.length">
            <div class="card__body">
                <div class="card__sizes">
                    <v-btn-toggle v-model="sizeSelector" color="primary" mandatory>
                        <v-btn v-for="{ size } of sizes" :key="size" variant="outlined" :ripple="false">
                            {{ size }}
                        </v-btn>
                    </v-btn-toggle>
                </div>
            </div>
            <v-divider />
        </template>

        <template v-if="optionsItems?.length">
            <div class="card__body">
                <h3>Добавить</h3>
                <div class="card__options">
                    <v-btn v-for="option in optionsItems" :key="option.id" variant="outlined" :ripple="false"
                        :active="isOptionSelected(option)" @click="onOptionClick(option)">
                        {{ option.name }} {{ option.price }}
                    </v-btn>
                </div>
            </div>
            <v-divider />
        </template>

        <div class="card__body">
            <div class="card__actions">
                <v-btn-toggle>
                    <v-btn variant="outlined" icon="mdi-minus" :ripple="false" @click="() => quantityComputed--" />
                    <v-btn variant="outlined" :ripple="false">{{ quantityComputed }}</v-btn>
                    <v-btn variant="outlined" icon="mdi-plus" :ripple="false" @click="() => quantityComputed++" />
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
import { isDrinkItem, type AnyMenuGroup, type DrinkSizeVariant, type MenuItem, type OptionsGroup, type OptionsMenuItem, } from '../menu/types';
import { useCart } from '@/composables/useCart';
import router from '@/router';

const route = useRoute();
const { menu, options } = useMenu();
const { addToCart } = useCart();

const quantity = ref(1);
const sizeSelector = ref<number>(1);

const quantityComputed = computed({
    get() {
        return quantity.value;
    },
    set(value) {
        quantity.value = value && value <= 20 ? value : quantity.value;
    },
});

const group = computed<AnyMenuGroup | null>(() => {
    const { group: groupId } = route.params
    return menu.value.find((item) => item.id === Number(groupId)) || null
})

const optionsItems = computed<OptionsMenuItem[] | null>(() => {
    const optionId = group.value?.optionsId
    return options.value.find((item) => item.id === Number(optionId))?.items || null
})

const item = computed<MenuItem | null>(() => {
    const { group: groupId, item: itemId } = route.params
    const group = menu.value.find((item) => item.id === Number(groupId))
    return group?.items.find((item) => item.id === Number(itemId)) || null
})

const sizes = computed<DrinkSizeVariant[] | null>(() =>
    isDrinkItem(item.value) ? item.value.sizes : null,
);

const selectedDrinkSize = computed<DrinkSizeVariant | null>(() =>
    sizes.value?.[sizeSelector.value] ?? null
);

const selectedOptions = ref<OptionsMenuItem[]>([]);

const basePrice = computed(() => {
    if (!item.value) return 0

    const basePrice = isDrinkItem(item.value) ? selectedDrinkSize.value?.price : item.value?.price

    const optionsPrice = selectedOptions.value.reduce((acc, value) => { return acc + (value.price ?? 0) }, 0)

    return basePrice ? basePrice + optionsPrice : 0
})

function onOptionClick(option: OptionsMenuItem): void {
    if (isOptionSelected(option)) {
        selectedOptions.value = selectedOptions.value.filter(
            ({ id }) => id !== option.id,
        );
    } else {
        selectedOptions.value.push(option);
    }
}

function isOptionSelected(option: OptionsMenuItem): boolean {
    return selectedOptions.value.some(({ id }) => id === option.id);
}

function onAdd(): void {
    if (!item.value) return

    addToCart({
        id: item.value.id,
        name: item.value.name,
        price: basePrice.value,
        quantity: quantity.value,
        size: selectedDrinkSize.value?.size,
        selectedOptions: selectedOptions.value
    });

    router.back();
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

    &__sizes,
    &__options,
    &__actions {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 5px;
    }
}
</style>
