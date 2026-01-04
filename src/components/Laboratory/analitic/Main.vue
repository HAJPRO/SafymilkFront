<template>
    <Title>
      <template v-slot:title>
        <h3><i class="fa-solid fa-contact-card mr-3 fa-md"></i>Labarotorya analiz ro'yxati</h3>
      </template>
    </Title>
    <HeaderTabs/>

    <Table/>
    <!-- <RawmaterialModal/> -->
 
</template>

<script setup>
import { onMounted, ref } from "vue";
import Title from "../../../components/Title.vue";
import Table from  "./Table.vue"
import HeaderTabs from  "./HeaderTabs.vue"
// import RawmaterialModal from  "./RawmaterialModal.vue"

</script>

<style scoped>

</style>