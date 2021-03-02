<template>
  <tailor-dialog
    v-model="dialog"
    @click:outside="reset"
    header-icon="mdi-image-multiple"
    width="608">
    <template #activator="{ on, attrs }">
      <select-poster-btn v-on="on" v-bind="attrs" :is-disabled="isDisabled" />
    </template>
    <template #header>
      Poster frame
    </template>
    <template #body>
      <p class="mb-3 text-left">
        Set an image that's displayed before the video is played.
      </p>
      <v-img
        :src="currentPosterFrame"
        :max-height="400"
        contain
        class="frame" />
      <select-poster
        @select="selectFrame"
        :options="generatedPosterFrames"
        :value="selectedFrame"
        class="mt-7" />
      <p class="my-3 text-left">or upload an image from your computer</p>
      <custom-poster-upload
        ref="posterUpload"
        @upload="setCustomPoster"
        :max-size="maxSize" />
    </template>
    <template #actions>
      <v-btn @click="reset" color="primary" text>Close</v-btn>
      <v-btn @click="save" color="success" text>Save</v-btn>
    </template>
  </tailor-dialog>
</template>

<script>
import CustomPosterUpload from './CustomPosterUpload.vue';
import SelectPoster from './SelectPoster.vue';
import SelectPosterBtn from './SelectPosterBtn.vue';
import TailorDialog from '@/tce-core/TailorDialog.vue';
import take from 'lodash/take';

const MAX_SIZE = 500000; // 500 KB
const CUSTOM_POSTER_FRAME_INDEX = 4;

export default {
  name: 'poster-frame-dialog',
  props: {
    id: { type: String, default: null },
    playable: { type: Boolean, default: false },
    selectedPosterFrameIndex: { type: Number, default: 0 },
    posterFrames: { type: Array, default: () => ([]) }
  },
  data() {
    return {
      dialog: false,
      image: null,
      selectedFrame: this.selectedPosterFrameIndex,
      maxSize: MAX_SIZE
    };
  },
  computed: {
    isDisabled: ({ id: videoId, playable }) => !videoId || !playable,
    generatedPosterFrames: ({ posterFrames }) => take(posterFrames, 4),
    customPosterFrame: ({ image, posterFrames }) => {
      return image || posterFrames[CUSTOM_POSTER_FRAME_INDEX];
    },
    currentPosterFrame() {
      const { customPosterFrame, posterFrames, selectedFrame } = this;
      return posterFrames[selectedFrame] || customPosterFrame;
    }
  },
  methods: {
    reset() {
      this.dialog = false;
      this.image = null;
      this.selectedFrame = this.selectedPosterFrameIndex;
      this.$refs.posterUpload.reset();
    },
    save() {
      const { image, selectedFrame } = this;
      const video = image
        ? { customPosterFrame: image }
        : { posterFrameIndex: selectedFrame };
      this.$emit('save', { video });
      this.reset();
    },
    selectFrame(index) {
      this.image = null;
      this.selectedFrame = index;
    },
    setCustomPoster(image) {
      this.selectedFrame = null;
      this.image = image;
    }
  },
  watch: {
    selectedPosterFrameIndex(selectedFrame) {
      this.selectedFrame = selectedFrame;
    }
  },
  components: {
    CustomPosterUpload,
    TailorDialog,
    SelectPosterBtn,
    SelectPoster
  }
};
</script>

<style lang="scss" scoped>
.frame {
  box-shadow: 0 0 0 1px #e1e1e1;
}
</style>
