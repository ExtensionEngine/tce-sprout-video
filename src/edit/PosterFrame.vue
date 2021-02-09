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
  box-shadow: 0 0 0 1px #e1e1e1;
  box-sizing: border-box;
  cursor: pointer;

  &.selected {
    box-shadow: 0 0 0 2px var(--v-success-darken1);
  }
}
</style>
