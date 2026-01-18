  <template>
  <Title class="shrink-0">
      <template v-slot:title>
        <h3 class="font-black italic tracking-tight flex items-center">
          <i class="fa-solid fa-gem mr-3 text-indigo-500"></i>
          Yorliq sozlamalari
        </h3>
      </template>
    </Title>
    <Label/>
 
</template>


<script setup>
import { onMounted, ref } from "vue";
import Title from "../../../components/Title.vue";
import Label from  "../../../components/Settings/Label/label.vue"

</script>



