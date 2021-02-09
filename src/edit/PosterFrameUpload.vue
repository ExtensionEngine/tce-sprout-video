<template>
  <tailor-dialog
    v-model="dialog"
    @click:outside="reset"
    header-icon="mdi-image-multiple"
    width="700">
    <template #activator="{ on, attrs }">
      <v-btn
        v-on="on"
        v-bind="attrs"
        :disabled="isDisabled"
        text>
        <v-icon class="mr-2">mdi-image-multiple</v-icon>
        Select poster
      </v-btn>
    </template>
    <template #header>
      Select poster frame
    </template>
    <template #body>
      <p class="mb-1 text-left">
        Select an image to display before video is played.
      </p>
      <v-img :src="currentPosterFrame" class="mb-4" />
      <div class="poster-frames-container">
        <poster-frame
          v-for="(poster, index) in generatedPosterFrames"
          :key="poster"
          @click="selectedIndex = index"
          :src="poster"
          :is-selected="selectedIndex === index" />
      </div>
      <div class="mt-3 text-left">
        <upload-btn
          @change="upload"
          label="Upload custom"
          accept="image/jpeg"
          small
          class="mt-3">
          <template #icon>
            <v-icon>mdi-upload</v-icon>
          </template>
        </upload-btn>
        <p :class="{ 'error--text': isError }" class="my-1 text-xs-caption">
          Poster frame must be under 500 kilobytes
        </p>
      </div>
    </template>
    <template #actions>
      <v-btn @click="reset" color="primary" text>Close</v-btn>
      <v-btn @click="save" color="success" text>Save</v-btn>
    </template>
  </tailor-dialog>
</template>

<script>
import isNil from 'lodash/isNil';
import PosterFrame from './PosterFrame.vue';
import TailorDialog from '../tce-core/TailorDialog.vue';
import take from 'lodash/take';
import UploadBtn from './UploadBtn.vue';

const MAX_SIZE = 500000; // 500 KB
const CUSTOM_POSTER_FRAME_INDEX = 4;

export default {
  name: 'poster-frame-upload',
  props: {
    id: { type: String, default: null },
    playable: { type: Boolean, default: false },
    selectedPosterFrameIndex: { type: Number, default: 0 },
    posterFrames: { type: Array, default: () => ([]) }
  },
  data: () => ({
    dialog: false,
    selectedIndex: null,
    image: null,
    isError: false
  }),
  computed: {
    isDisabled: ({ id: videoId, playable }) => !videoId || !playable,
    generatedPosterFrames: ({ posterFrames }) => take(posterFrames, 4),
    customPosterFrame: ({ image, posterFrames }) => {
      return image || posterFrames[CUSTOM_POSTER_FRAME_INDEX];
    },
    currentPosterFrame() {
      const { customPosterFrame, posterFrames, selectedPosterFrameIndex } = this;
      return customPosterFrame || posterFrames[selectedPosterFrameIndex];
    }
  },
  methods: {
    reset() {
      this.dialog = false;
      this.image = null;
      this.selectedIndex = null;
      this.isError = false;
    },
    upload(e) {
      this.isError = false;
      this.image = null;
      const [file] = e.target.files;
      if (file.size > MAX_SIZE) {
        this.isError = true;
        return;
      }
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.addEventListener('load', e => {
        this.image = e.target.result;
      });
    },
    save() {
      const { image, selectedIndex, selectedPosterFrameIndex } = this;
      if (image) {
        this.$emit('save', {
          video: {
            customPosterFrame: image
          }
        });
      } else {
        this.$emit('save', {
          video: {
            posterFrameNumber: isNil(selectedIndex) ? selectedPosterFrameIndex : selectedIndex
          }
        });
      }
      this.reset();
    }
  },
  watch: {
    selectedPosterFrameIndex: {
      handler: function () {
        this.selectedIndex = this.selectedPosterFrameIndex;
      },
      immediate: true
    }
  },
  components: { PosterFrame, UploadBtn, TailorDialog }
};
</script>

<style lang="scss" scoped>
.poster-frames-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 5px;
}
</style>
