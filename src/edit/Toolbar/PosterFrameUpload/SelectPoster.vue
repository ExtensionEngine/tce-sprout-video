<template>
  <div>
    <p class="mb-3 text-left">
      Set an image that's displayed before the video is played.
    </p>
    <v-img :src="currentPosterFrame" class="frame" />
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
    currentPosterFrame: { type: String, default: null },
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

.frame {
  box-shadow: 0 0 0 1px #e1e1e1;
}
</style>
