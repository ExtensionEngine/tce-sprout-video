<template>
  <div ref="player" class="player d-flex align-center justify-center"></div>
</template>

<script>
export default {
  name: 'sprout-player',
  inject: ['$elementBus'],
  props: {
    embedCode: { type: String, default: null }
  },
  methods: {
    setVideo() {
      const { player } = this.$refs;
      if (!player) return;
      player.innerHTML = this.embedCode;
    }
  },
  watch: {
    embedCode: 'setVideo'
  },
  mounted() {
    this.setVideo();
    this.$elementBus.on('reload', this.setVideo);
  }
};
</script>

<style lang="scss" scoped>
.player {
  min-height: 22.5rem;
  background: #000;

  ::v-deep .sproutvideo-player {
    max-width: 100%;
  }
}
</style>
