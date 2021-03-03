<template>
  <div class="text-left">
    <upload-btn
      @change="validateSize($event) && upload($event)"
      label="Upload image"
      accept="image/jpeg"
      small depressed />
    <p
      :class="{ 'msg-hidden': !isOverMaxSize }"
      class="mt-1 mb-0 text-caption error--text">
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
        return false;
      }
      return true;
    },
    upload(e) {
      const [file] = e.target.files;
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

<style lang="scss" scoped>
.msg-hidden {
  visibility: hidden;
}
</style>
