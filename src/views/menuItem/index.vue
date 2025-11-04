<template>
    <div class="card">
        <div class="card__header">
            <h2>{{ item?.name }}</h2>
            <!--   <p>{{ description }}</p> -->
            <h3>{{ price + "₽" }}</h3>
        </div>
        <v-divider />

        <template v-if="groupType === MenuGroupType.Drinks">
            <div class="card__body">
                <div class="card__size-container">
                    <v-btn-toggle v-model="drinkSize" color="primary" mandatory>
                        <v-btn variant="outlined" :ripple="false">M</v-btn>
                        <v-btn variant="outlined" :ripple="false">L</v-btn>
                        <v-btn variant="outlined" :ripple="false">S</v-btn>
                    </v-btn-toggle>
                </div>

            </div>
            <v-divider />
        </template>

        <template v-if="true">
            <div class="card__body">
                <h3>Добавить</h3>
                <div class="card__size-container">
                    <v-btn-toggle color="primary" multiple>
                        <v-btn variant="outlined" :ripple="false">Сахар</v-btn>
                        <v-btn variant="outlined" :ripple="false">Корица</v-btn>
                    </v-btn-toggle>
                </div>

            </div>
            <v-divider />
        </template>

        <template v-if="true">
            <div class="card__body">
                <div class="card__size-container">
                    <v-btn-toggle>
                        <v-btn variant="outlined" icon="mdi-minus" :ripple="false" @click="() => countComputed--" />
                        <v-btn variant="outlined" :ripple="false">{{ countComputed }}</v-btn>
                        <v-btn variant="outlined" icon="mdi-plus" :ripple="false" @click="() => countComputed++" />
                    </v-btn-toggle>
                    <v-btn height="48" color="primary" :ripple="false">Добавить</v-btn>
                </div>
            </div>
        </template>


    </div>
</template>

<script lang="ts" setup>
import { useMenu } from '@/composables/useMenu';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { DrinkSize, isDrinkItem, MenuGroupType, type DrinkMenuItem, type MenuItem, type SimpleMenuItem } from '../menu/types';

const route = useRoute()
const { menu } = useMenu()
const groupType = ref<MenuGroupType>(MenuGroupType.Other)
const count = ref(1)
const drinkSize = ref<DrinkSize>(1)

const countComputed = computed({ get() { return count.value }, set(value) { count.value = value && value <= 10 ? value : count.value } })

const item = computed<MenuItem | null>(() => {
    const { group: groupId, item: itemId } = route.params
    const group = menu.value.find((item) => item.id === Number(groupId))
    groupType.value = group?.type || MenuGroupType.Other
    return group?.items.find((item) => item.id === Number(itemId)) || null
})

const price = computed(() => {
    if (!item.value) return 0

    const basePrice = isDrinkItem(item.value) ? item.value.sizes[drinkSize.value]?.price : item.value.price

    return basePrice ? basePrice * count.value : 0
})

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