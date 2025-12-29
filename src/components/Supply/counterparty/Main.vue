<template>
    <Title>
      <template v-slot:title>
        <h3><i class="fa-solid fa-contact-card mr-3 fa-md"></i>Kontragentlar ro'yxati</h3>
      </template>
    </Title>
    <Tabel/>
 
</template>

<script setup>
import { onMounted, ref } from "vue";
import Title from "../../../components/Title.vue";
import Tabel from  "../../../components/Supply/counterparty/Tabel.vue"

</script>

<style scoped>

</style>