<template>
  <v-btn
    @click="$refs.uploadInput.click()"
    v-bind="$attrs"
    color="primary darken-3"
    text
    class="upload-btn text-uppercase">
    <slot name="icon">
      <v-icon color="secondary darken-1" class="mr-2">mdi-cloud-upload-outline</v-icon>
    </slot>
    {{ label }}
    <input
      ref="uploadInput"
      @click="$refs.uploadInput.value = null"
      @change="$emit('change', $event)"
      :accept="accept"
      type="file"
      class="d-none">
  </v-btn>
</template>

<script>
export default {
  name: 'video-upload-btn',
  props: {
    label: { type: String, required: true },
    accept: { type: String, default: 'video/*' }
  }
};
</script>

<style lang="scss" scoped>
.upload-btn.v-btn {
  height: 100%;
}
</style>
