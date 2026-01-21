const functions = {
  playing: false,
  audio: null as AudioContext | null,

  play(url: string, volume: number = 100, replace = false) {
    if (!url || !url.length) {
      throw new Error('No sound URL provided');
    }

    try {
      if (replace && this.playing && this.audio && this.audio.state !== 'closed') this.audio.close();

      let ctx = new AudioContext();
      let gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);

      if (replace) {
        this.audio = ctx;
        this.playing = true;
      }

      fetch(url)
        .then((data) => data.arrayBuffer())
        .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
        .then((decodedAudio) => {
          if (ctx.state !== 'closed') {
            const playSound = ctx.createBufferSource();
            playSound.buffer = decodedAudio;
            playSound.connect(gainNode);
            gainNode.gain.value = volume / 100;
            playSound.start(ctx.currentTime);
          }
        });
    } catch (error) {
      throw new Error(`Error playing sound: ${error}`);
    }
  },
};

export default functions;
