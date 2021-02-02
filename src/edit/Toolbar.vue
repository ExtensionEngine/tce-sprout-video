<template>
  <v-toolbar
    height="72"
    color="transparent"
    class="elevation-0">
    <v-toolbar-title class="pl-1 text-left">Sprout Video</v-toolbar-title>
    <v-toolbar-items class="mx-auto">
      <upload-btn
        v-if="!fileName"
        @change="upload"
        label="Upload Sprout video"
        accept="video/*"
        class="upload-btn" />
      <v-text-field
        v-else
        :value="fileName"
        readonly hide-details filled />
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
import UploadBtn from './UploadBtn.vue';

export default {
  name: 'tce-sprout-video-toolbar',
  inject: ['$elementBus'],
  props: {
    element: { type: Object, required: true }
  },
  computed: {
    fileName: ({ element }) => element.data?.fileName
  },
  methods: {
    upload(e) {
      const [file] = e.target.files;
      this.$elementBus.emit('save', { file });
    }
  },
  components: { UploadBtn }
};
</script>

<style lang="scss" scoped>
.v-toolbar__title {
  min-width: 23.875rem;
}

.upload-btn ::v-deep .v-btn {
  height: 100%;

  &__content {
    padding: 1.5rem 0;
  }
}

.v-text-field {
  min-width: 21.875rem;
  margin: 0.5rem 0.75rem 0 1.75rem;
}
</style>
