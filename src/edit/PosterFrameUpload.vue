<template>
  <v-dialog v-model="dialog" width="600">
    <template #activator="{ on, attrs }">
      <v-btn
        v-on="on"
        v-bind="attrs"
        :disabled="isDisabled"
        text>
        <v-icon class="mr-2">mdi-image-multiple</v-icon>
        Poster Frame
      </v-btn>
    </template>
    <v-card>
      <v-card-title primary-title class="dialog-title primary darken-1">
        <div class="text-truncate white--text">Poster frame</div>
      </v-card-title>
      <v-card-text class="text-left pt-7 px-4 pb-2">
        Select an image to display before video is played.
      </v-card-text>
      <v-card-actions class="px-4 pb-3">
        <v-spacer />
        <v-btn @click="dialog = false" color="primary" text>Close</v-btn>
        <v-btn @click="dialog = false" color="success" text>Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'poster-frame-upload',
  props: {
    video: { type: Object, required: true }
  },
  data: () => ({ dialog: false }),
  computed: {
    isDisabled() {
      const { id: videoId, playable } = this.video;
      return !videoId || !playable;
    }
  }
};
</script>
