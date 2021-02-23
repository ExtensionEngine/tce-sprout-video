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
      <v-img :src="currentPosterFrame" class="frame" />
      <select-poster
        @select="selectedIndex = $event"
        :generated-poster-frames="generatedPosterFrames"
        :selected-index="selectedIndex"
        :is-custom="!!image" />
      <p class="my-3 text-left">or upload an image from your computer</p>
      <custom-poster-upload
        @upload="upload"
        :is-error="isError"
        :error-message="errorMessage" />
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
const FILE_SIZE_ERROR_MSG = 'Poster frame must be under 500KB.';

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
      selectedIndex: this.selectedPosterFrameIndex,
      isError: false,
      errorMessage: FILE_SIZE_ERROR_MSG
    };
  },
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
      this.selectedIndex = this.selectedPosterFrameIndex;
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
      const { image, selectedIndex } = this;
      const video = image
        ? { customPosterFrame: image }
        : { posterFrameNumber: selectedIndex };
      this.$emit('save', { video });
      this.reset();
    }
  },
  watch: {
    selectedPosterFrameIndex: {
      handler: function () {
        this.selectedIndex = this.selectedPosterFrameIndex;
      }
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
