<template>
  <Title>
  <template v-slot:title>
    <h3>
       <i class="fa-solid fa-list mr-3 fa-md"></i>
      Mahsulotlar boshqaruvi
    </h3> 
  </template>
</Title>

    <!-- <HeaderTabLink/> -->
    <Tabel/>
    <Scaner/>
 
</template>

<script setup>
import { onMounted, ref } from "vue";
import Title from "../../../components/Title.vue";
import HeaderTabLink from  "../../../components/Sale/products/HeaderTabLink.vue"
import Tabel from  "../../../components/Sale/products/Tabel.vue"
import Scaner from  "../../../components/BarcodeScaner/scaner.vue"

</script>

<style scoped>

</style>