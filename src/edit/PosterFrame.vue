<template>
  <v-img
    v-on="$listeners"
    v-bind="$attrs"
    :src="src"
    :class="{ 'selected': isSelected }"
    class="poster-frame" />
</template>

<script>
export default {
  name: 'poster-frame',
  inheritAttrs: false,
  props: {
    src: { type: String, required: true },
    isSelected: { type: Boolean, default: false }
  }
};
</script>

<style lang="scss" scoped>
.poster-frame {
  box-sizing: border-box;
  cursor: pointer;

  &.selected {
    border: 3px solid var(--v-success-darken1);
  }
}
</style>
