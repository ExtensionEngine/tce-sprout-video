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
    <p
      v-if="maxSize"
      :class="{ 'error--text': isError }"
      class="mt-1 text-caption">
      Poster frame must be under {{ maxSizeInKb }}KB.
    </p>
  </div>
</template>

<script>
import UploadBtn from '../UploadBtn.vue';

export default {
  name: 'custom-poster-upload',
  props: {
    maxSize: { type: Number, default: null }
  },
  data: () => ({ isError: false }),
  computed: {
    maxSizeInKb: vm => vm.maxSize && vm.maxSize / 1000
  },
  methods: {
    validateSize(e) {
      this.isError = false;
      const [file] = e.target.files;
      if (this.maxSize && file.size > this.maxSize) {
        this.isError = true;
        return;
      }
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.addEventListener('load', e => {
        this.$emit('upload', e.target.result);
      });
    }
  },
  components: { UploadBtn }
};
</script>
