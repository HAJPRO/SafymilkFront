<template>
    <Title>
      <template v-slot:title>
        <h3><i class="fa-solid fa-contact-card mr-3 fa-md"></i>Sut kirim qilish</h3>
      </template>
    </Title>
    <Inbound/>
 
</template>

<script setup>
import { onMounted, ref } from "vue";
import Title from "../../../components/Title.vue";
import Inbound from  "../../../components/Supply/inbound/Inbound.vue"

</script>

<style scoped>

</style>