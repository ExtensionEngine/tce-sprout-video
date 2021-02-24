<template>
  <div class="text-left">
    <upload-btn
      @change="validateSize"
      label="Upload image"
      accept="image/jpeg"
      small depressed>
      <template #icon>
        <v-icon>mdi-upload</v-icon>
      </template>
    </upload-btn>
    <p
      v-if="maxSize"
      :class="{ 'error--text': isOverMaxSize }"
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
  data: () => ({ isOverMaxSize: false }),
  computed: {
    maxSizeInKb: vm => vm.maxSize && vm.maxSize / 1000
  },
  methods: {
    validateSize(e) {
      this.reset();
      const [file] = e.target.files;
      if (this.maxSize && file.size > this.maxSize) {
        this.isOverMaxSize = true;
        return;
      }
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.addEventListener('load', e => {
        this.$emit('upload', e.target.result);
      });
    },
    reset() {
      this.isOverMaxSize = false;
    }
  },
  components: { UploadBtn }
};
</script>
