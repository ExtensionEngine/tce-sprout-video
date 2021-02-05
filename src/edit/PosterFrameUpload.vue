<template>
  <tailor-dialog v-model="dialog" @click:outside="reset" width="700">
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
      <p class="px-2 text-left">
        Select an image to display before video is played.
      </p>
      <div class="poster-frames-container d-flex">
        <poster-frame
          v-for="(poster, index) in posterFrames"
          :key="poster"
          @click="selectedIndex = index"
          :src="poster"
          :is-selected="index === selectedIndex"
          class="mr-2" />
      </div>
      <div class="my-4 px-2">
        <upload-btn
          @change="upload"
          label="Upload custom"
          accept="image/jpeg">
          <template #icon>
            <v-icon>mdi-upload</v-icon>
          </template>
        </upload-btn>
        <p v-if="file" class="my-0">{{ file.name }}</p>
      </div>
    </template>
    <template #actions>
      <v-btn @click="reset" color="primary" text>Close</v-btn>
      <v-btn @click="save" color="success" text>Save</v-btn>
    </template>
  </tailor-dialog>
</template>

<script>
import PosterFrame from './PosterFrame.vue';
import TailorDialog from '../tce-core/TailorDialog.vue';
import UploadBtn from './UploadBtn.vue';

const MAX_SIZE = 500000; // 500 KB

export default {
  name: 'poster-frame-upload',
  props: {
    id: { type: String, default: null },
    playable: { type: Boolean, default: false },
    selectedPosterFrameIndex: { type: Number, default: 0 },
    posterFrames: { type: Array, default: () => ([]) }
  },
  data: () => ({ dialog: false, selectedIndex: null, file: null }),
  computed: {
    isDisabled() {
      const { id: videoId, playable } = this;
      return !videoId || !playable;
    }
  },
  methods: {
    reset() {
      this.dialog = false;
      this.selectedIndex = this.selectedPosterFrameIndex;
      this.file = null;
    },
    upload(e) {
      this.file = null;
      const [file] = e.target.files;
      if (file.size > MAX_SIZE) return;
      this.file = file;
    },
    save() {
      if (this.file) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(this.file);
        fileReader.addEventListener('load', e => {
          this.$emit('save', {
            video: {
              customPosterFrame: e.target.result
            }
          });
        });
      } else {
        this.$emit('save', {
          video: {
            posterFrameNumber: this.selectedIndex
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
  justify-content: space-evenly;
}
</style>
