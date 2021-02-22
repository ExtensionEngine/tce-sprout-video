<template>
  <div>
    <p class="mt-7 mb-3 text-left">
      Pick a frame from the video
    </p>
    <div class="poster-frames-container">
      <poster-frame
        v-for="(poster, index) in generatedPosterFrames"
        :key="poster"
        @click="$emit('select', index)"
        :src="poster"
        :is-selected="!isCustom && (selectedIndex === index)" />
    </div>
  </div>
</template>

<script>
import PosterFrame from './PosterFrame.vue';

export default {
  name: 'select-poster',
  props: {
    generatedPosterFrames: { type: Array, default: () => ([]) },
    isSelected: { type: Boolean, default: false },
    selectedIndex: { type: Number, default: 0 },
    isCustom: { type: Boolean, default: false }
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
