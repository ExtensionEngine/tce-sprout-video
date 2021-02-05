<template>
  <v-toolbar height="72" color="transparent" class="elevation-0">
    <v-toolbar-title class="pl-1 text-left">Sprout Video</v-toolbar-title>
    <v-toolbar-items class="mx-auto">
      <video-upload @save="onSave" v-bind="element.data" />
      <caption-upload @save="onSave" v-bind="element.data" />
      <poster-frame-upload @save="onSave" v-bind="element.data.video" />
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
import CaptionUpload from './CaptionUpload.vue';
import PosterFrameUpload from './PosterFrameUpload.vue';
import VideoUpload from './VideoUpload.vue';

export default {
  name: 'tce-sprout-video-toolbar',
  inject: ['$elementBus'],
  props: {
    element: { type: Object, required: true }
  },
  methods: {
    onSave(payload) {
      this.$elementBus.emit('save', payload);
    }
  },
  components: { VideoUpload, CaptionUpload, PosterFrameUpload }
};
</script>

<style lang="scss" scoped>
.v-toolbar__title {
  min-width: 23.875rem;
}
</style>
