<template>
  <tailor-dialog v-model="dialog" header-icon="mdi-alert" width="500">
    <template #activator="scope">
      <slot v-bind="scope"></slot>
    </template>
    <template #header>Delete caption?</template>
    <template #body>
      <div class="text-left">Are you sure you want to delete caption?</div>
    </template>
    <template #actions>
      <v-btn @click="dialog = false" color="primary" text>Close</v-btn>
      <v-btn @click="confirm" color="secondary" text>Delete caption</v-btn>
    </template>
  </tailor-dialog>
</template>

<script>
import TailorDialog from '@/tce-core/TailorDialog.vue';

export default {
  name: 'confirmation-dialog',
  data: () => ({ dialog: false }),
  methods: {
    confirm() {
      this.dialog = false;
      this.$emit('confirm');
    }
  },
  components: { TailorDialog }
};
</script>
