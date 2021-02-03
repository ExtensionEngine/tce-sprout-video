<template>
  <v-dialog
    v-model="dialog"
    width="500">
    <template #activator="scope">
      <slot v-bind="scope"></slot>
    </template>

    <v-card>
      <v-card-title primary-title class="dialog-title primary darken-1">
        <v-avatar
          color="secondary"
          size="38"
          class="mr-3">
          <v-icon dark>mdi-alert</v-icon>
        </v-avatar>
        <div class="text-truncate white--text">
          Delete caption?
        </div>
      </v-card-title>
      <v-card-text class="text-left pt-7 px-4 pb-2">
        Are you sure you want to delete caption?
      </v-card-text>
      <v-card-actions class="px-4 pb-3">
        <v-spacer />
        <v-btn
          @click="dialog = false"
          color="primary"
          text>
          Close
        </v-btn>
        <v-btn
          @click="confirm"
          color="error"
          text>
          Delete caption
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'confirmation-dialog',
  data: () => ({ dialog: false }),
  methods: {
    confirm() {
      this.dialog = false;
      this.$emit('confirm');
    }
  }
};
</script>
