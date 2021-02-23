<template>
  <div class="text-left">
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
      {{ errorMessage }}
    </p>
  </div>
</template>

<script>
import UploadBtn from '../UploadBtn.vue';

export default {
  name: 'custom-poster-upload',
  props: {
    isError: { type: Boolean, default: false },
    errorMessage: { type: String, default: null }
  },
  components: { UploadBtn }
};
</script>
