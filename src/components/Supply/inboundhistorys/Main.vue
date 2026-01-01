<template>
    <Title>
      <template v-slot:title>
        <h3><i class="fa-solid fa-file-archive mr-3 fa-md"></i>Xomashyo kirim ro'yxati</h3>
      </template>
    </Title>
    <Table/>
    <!-- <RawmaterialModal/> -->
 
</template>

<script setup>
import { onMounted, ref } from "vue";
import Title from "../../../components/Title.vue";
import Table from  "./Table.vue"

</script>

<style scoped>

</style>