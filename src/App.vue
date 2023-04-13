<script setup lang="ts">
import { ref, type Ref } from "vue";

import maskedInput from "@/components/vue-masked-input.vue.js";

const masked: Ref<string> = ref("");
const country: Ref<string> = ref("");
const maskedData: Ref<Record<any, any>> = ref({});
</script>

<template>
  {{ masked }} - {{ country }} - {{ maskedData }}
  <!-- app -->
  <div class="w-64 m-auto mt-10 flex flex-col">
    <masked-input
      @masked="masked = $event"
      @country="country = $event"
      @maskedData="maskedData = $event"
      name="cmasked"
      label="Entrer votre télémasked"
      required
      :allowed="[]"
      :value="'22995318207'"
      maska="#-###"
    />
  </div>
</template>

<style scoped></style>
