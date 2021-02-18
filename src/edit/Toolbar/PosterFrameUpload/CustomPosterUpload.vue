<template>
  <div class="text-left">
    <p class="my-3">or upload an image from your computer</p>
    <upload-btn
      @change="$emit('upload', $event)"
      label="Upload image"
      accept="image/jpeg"
      small depressed>
      <template #icon>
        <v-icon>mdi-upload</v-icon>
      </template>
    </upload-btn>
    <p :class="{ 'error--text': isError }" class="mt-1 text-caption">
      Poster frame must be under 500KB.
    </p>
  </div>
</template>

<script>
import UploadBtn from '../UploadBtn.vue';

export default {
  name: 'custom-poster-upload',
  props: {
    isError: { type: Boolean, default: false }
  },
  components: { UploadBtn }
};
</script>
