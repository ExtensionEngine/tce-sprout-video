<template>
  <div>
    <p class="mb-3 text-left">
      Pick a frame from the video
    </p>
    <div class="poster-frames-container">
      <poster-frame
        v-for="(poster, index) in options"
        :key="poster"
        @click="$emit('select', index)"
        :src="poster"
        :is-selected="isSelected(index)" />
    </div>
  </div>
</template>

<script>
import isNil from 'lodash/isNil';
import PosterFrame from './PosterFrame.vue';

export default {
  name: 'select-poster',
  props: {
    options: { type: Array, default: () => [] },
    value: { type: Number, default: null }
  },
  methods: {
    isSelected(index) {
      return isNil(index) ? false : (this.value === index);
    }
  },
  components: { PosterFrame }
};
</script>

<style lang="scss" scoped>
.poster-frames-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 0.5rem;
}
</style>
