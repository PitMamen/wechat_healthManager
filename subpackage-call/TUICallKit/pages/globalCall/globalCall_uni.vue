<template>
    <tuicallkit ref="TUICallKit"></tuicallkit>
</template>

<script>
import { MEDIA_TYPE } from '../../utils/constants';
export default {
    onLoad(option) {
        const config = JSON.parse(option.configData);
        this.$nextTick(async () => {
           await this.$refs.TUICallKit.init(config);
           const event = JSON.parse(option.data);
           wx.$TUICallEngine.setPusherAttributesHandler({
            enableCamera: this.data.config.type === MEDIA_TYPE.VIDEO,
          });
           wx.$TUICallEngine.TRTCCallingDelegate.onInvited(event.data);
           wx.createLivePusherContext().startPreview();
        })
    },
    created() {

    },
    onUnload() {
        this.$refs.TUICallKit.destroyed();
    },
}
</script>

<style>
</style>