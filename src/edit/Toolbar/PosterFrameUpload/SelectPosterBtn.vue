<template>
  <v-btn
    v-on="$listeners"
    v-bind="$attrs"
    :disabled="isDisabled"
    text>
    <v-icon class="mr-2">mdi-image-multiple</v-icon>
    Select poster frame
  </v-btn>
</template>

<script>
export default {
  name: 'select-poster-btn',
  inheritAttrs: false,
  props: {
    isDisabled: { type: Boolean, default: false }
  }
};
</script>
