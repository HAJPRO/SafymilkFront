<template>
    <Title>
      <template v-slot:title>
        <h3><i class="fa-solid fa-contact-card mr-3 fa-md"></i>Xomashyo</h3>
      </template>
    </Title>
    <Table/>
    <!-- <RawmaterialModal/> -->
 
</template>

<script setup>
import { onMounted, ref } from "vue";
import Title from "../../../components/Title.vue";
import Table from  "../../Supply/rawmaterial/Tabel.vue"
// import RawmaterialModal from  "./RawmaterialModal.vue"

</script>

<style scoped>

</style>