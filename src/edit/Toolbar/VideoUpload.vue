<template>
  <span>
    <upload-btn
      v-if="!video.fileName"
      @change="upload"
      label="Upload Sprout video" />
    <v-text-field
      v-else
      :value="video.fileName"
      readonly hide-details filled>
      <template #prepend-inner>
        <v-icon>mdi-video</v-icon>
      </template>
    </v-text-field>
  </span>
</template>

<script>
import { ELEMENT_STATE } from '../../shared';
import UploadBtn from './UploadBtn.vue';

export default {
  name: 'video-upload',
  props: {
    video: { type: Object, required: true }
  },
  methods: {
    upload(e) {
      const [file] = e.target.files;
      this.$emit('save', {
        video: {
          file,
          fileName: file.name,
          status: ELEMENT_STATE.UPLOADING,
          error: null
        }
      });
    }
  },
  components: { UploadBtn }
};
</script>

<style lang="scss" scoped>
.v-text-field {
  min-width: 21.875rem;
  margin: 0.5rem 0.75rem 0 1.75rem;
}
</style>
