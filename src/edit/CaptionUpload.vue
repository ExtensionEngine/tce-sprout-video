<template>
  <span>
    <upload-btn
      v-if="!fileName"
      @change="upload"
      :disabled="isDisabled"
      label="Upload caption"
      accept="text/vtt" />
    <v-text-field
      v-if="fileName"
      :value="fileName"
      readonly hide-details filled>
      <template #prepend-inner>
        <v-icon>mdi-closed-caption</v-icon>
      </template>
      <template #append>
        <confirmation-dialog v-slot="{ on, attrs }" @confirm="remove">
          <v-icon
            v-on="on"
            v-bind="attrs"
            class="delete-caption"
            color="error">
            mdi-delete
          </v-icon>
        </confirmation-dialog>
      </template>
    </v-text-field>
  </span>
</template>

<script>
import ConfirmationDialog from './ConfirmationDialog.vue';
import { ELEMENT_STATE } from '../shared';
import UploadBtn from './UploadBtn.vue';

export default {
  name: 'caption-upload',
  props: {
    video: { type: Object, required: true },
    caption: { type: Object, required: true }
  },
  computed: {
    fileName: ({ caption }) => caption?.fileName,
    isDisabled() {
      const { id: videoId, playable } = this.video;
      return !videoId || !playable || this.fileName;
    }
  },
  methods: {
    upload(e) {
      const [file] = e.target.files;
      const fileReader = new window.FileReader();
      fileReader.readAsText(file);
      fileReader.addEventListener('load', e => {
        this.$emit('save', {
          caption: {
            fileName: file.name,
            content: e.target.result,
            status: ELEMENT_STATE.UPLOADING
          }
        });
      });
    },
    remove() {
      this.$emit('save', {
        caption: {
          fileName: null,
          status: ELEMENT_STATE.DELETING
        }
      });
    }
  },
  components: { ConfirmationDialog, UploadBtn }
};
</script>

<style lang="scss" scoped>
.v-text-field {
  min-width: 21.875rem;
  margin: 0.5rem 0.75rem 0 1.75rem;
}
</style>
