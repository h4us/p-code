<template>
  <div ref="sketch" style="width: 100vw; height:100vh;"></div>
</template>

<script>
import p5 from 'p5';
import Tone from 'tone';

// TODO:
import {
  createWorker,
  // PSM,
  OEM
} from 'tesseract.js';

const worker = createWorker({
  //
});
// --

export default {
  name: 'v-p5',

  data() {
    return {
      //! p5.js instances
      p5: null,
      filtered: null,
      capture: null,
      //! tone.js instances
      sine: null,
      saw: null,
      tri: null,
      square: null,
      noise: null,
      //
      pointer: 0,
      didLoad: false,
      freq: 440,
      prevChar: '',
      tokens: [],
      //
      dlw: false,
      camFace: 'environment',
      isPlaying: false,
      doLoop: true,
    }
  },
  
  components: {
    // HelloWorld
  },
  
  mounted() {
    const rf = this.$refs['sketch'];
    const p5fn = (sketch) => {
      sketch.preload = () => {
        //
        // console.log('preload');
      }

      sketch.setup = () => {
        sketch.createCanvas(rf.clientWidth, rf.clientHeight);
        this.filtered = sketch.createGraphics(rf.clientWidth, rf.clientHeight);
        sketch.frameRate(30);
        sketch.background('black');

        this.capture = sketch.createCapture({
          video: {
            // TODO:
            // width: { min: 320, ideal: 640 },
            // height: { min: 240, ideal: 480 },
            facingMode: {
              ideal: 'environment'
            }
          },
          audio: false
        }, (v) => {
          console.log(v);
          console.log(
            this.$refs['sketch'].clientWidth, this.$refs['sketch'].clientHeight,
            this.capture.elt.videoWidth, this.capture.elt.videoHeight
          );
        });
        this.capture.hide();

        this.sine = new Tone.Oscillator(this.freq, 'sine').toMaster();
        this.saw = new Tone.Oscillator(this.freq, 'sawtooth').toMaster();
        this.tri = new Tone.Oscillator(this.freq, 'triangle').toMaster();
        this.square = new Tone.Oscillator(this.freq, 'square').toMaster();
        this.noise = new Tone.Noise('white');
      }

      sketch.draw = () => {
        const bCanvas = this.$refs['sketch'];

        if (this.capture && this.capture.elt) {
          this.filtered.image(this.capture, 0, 0, bCanvas.clientWidth, bCanvas.clientHeight);
          this.filtered.filter(sketch.THRESHOLD, 0.5);

          const wScale = bCanvas.clientWidth / this.capture.elt.videoWidth;

          sketch.image(
            this.capture,
            0,
            (this.capture.elt.videoHeight * wScale) < bCanvas.clientHeight ? (bCanvas.clientHeight - this.capture.elt.videoHeight * wScale) * 0.5 : 0,
            bCanvas.clientWidth,
            this.capture.elt.videoHeight * wScale
          );
        }

        // if(didLoad) {
        if(this.isPlaying) {
          if(this.pointer < this.tokens.length) {
            let node = this.tokens[this.pointer];
            this.execute(node);
            this.pointer++;
          } else {
            this.isPlaying = false;
          }
        } else {
          if(this.doLoop) {
            this.pointer = 0;
            this.isPlaying = true;
          } else {
            if(this.sine.state == 'started') {
              this.sine.stop(0);
            }

            if(this.saw.state == 'started') {
              this.saw.stop(0);
            }

            if(this.tri.state == 'started') {
              this.tri.stop(0);
            }

            if(this.square.state == 'started') {
              this.square.stop(0);
            }

            if(this.noise.state == 'started') {
              this.noise.stop(0);
            }

            this.prevChar = '';
          }
        }
        //}
      }

      this.p5 = sketch;
    };

    new p5(p5fn, rf);
  },

  methods: {
    async recognize() {
      // TODO: 
      // this.dlw = true;
      const img = this.filtered.elt;

      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      await worker.setParameters({
        tessedit_ocr_engine_mode: OEM.OEM_TESSERACT_LSTM_COMBINED,
        // tessedit_pageseg_mode: PSM.SINGLE_BLOCK
        // tessedit_pageseg_mode: PSM.SINGLE_LINE,
        tessedit_char_whitelist: '0123456789~^+*-=[<>\\/'
      });
      const { data: { text } } = await worker.recognize(img);

      let code = text;

      if(code) {
        code = this.unpack(code);

        while(code.indexOf('<') > -1) {
          code = this.unpack(code);
        }

        let lex = code.match(/(\D+)|[+-]?(\d*[.])?\d+/gi);
        this.parse(lex);
        this.isPlaying = true;
      }
    },

    unpack(code) {
      let pointer = 0;
      let result = '';
      let start = 0;
      let end = 0;
      let stack = 0;

      let peek = () => {
        return code[pointer];
      }

      let consume = () => {
        pointer++;
      }

      while(pointer < code.length) {
        let t = peek();
        if(t == "<") {
          if(stack == 0) {
            start = pointer;
          }
          stack++;
        } else if(t == ">") {
          end = pointer;
          stack--;
          if(stack == 0) {
            result += code.slice(start+1, end).repeat(2);
          }
        } else {
          if(stack == 0) {
            result += t;
          }
        }
        consume();
      }

      return result;
    },

    parse(l) {
      this.pointer = 0;
      this.tokens = [];
      if(l) {
        for(let i=0; i<l.length; i++) {
          if(isNaN(l[i])) {
            let chars = l[i].split('');
            for(let j=0; j<chars.length; j++) {
              this.tokens.push(chars[j]);
            }
          } else {
            this.tokens.push(l[i]);
          }
        }
      }
    },

    execute(t) {
      if(t != this.prevChar) {
        if(isNaN(t)) {
          switch (t) {
          case '~':
            this.sine.start(0);
            break;
          case 'N':
            this.saw.start(0);
            break;
          case '^':
            this.tri.start(0);
            break;
          case '[':
            this.square.start(0);
            break;
          case '=':
            this.sine.stop(0);
            this.saw.stop(0);
            this.tri.stop(0);
            this.square.stop(0);
            this.noise.stop(0);
            break;
          case '+':
          case '-':
          case '*':
          case '/':
          case '<':
          case '>':
            break;
          default:
            this.noise.start(0);
          }
        } else {
          if(this.prevChar == '+') {
            this.freq += parseFloat(t);
          } else if(this.prevChar == '-') {
            this.freq -= parseFloat(t);
          } else if(this.prevChar == '*') {
            this.freq *= parseFloat(t);
          } else if(this.prevChar == '/') {
            this.freq /= parseFloat(t);
          } else {
            this.freq = parseFloat(t);
          }

          if(!isNaN(this.freq)) {
            this.sine.frequency.value= this.freq;
            this.saw.frequency.value = this.freq;
            this.tri.frequency.value = this.freq;
            this.square.frequency.value = this.freq;
          }
        }
      }
      this.prevChar = t;
    },

    openDrawer() {
      this.dlw = true;
    },

    flipCamera() {
      this.capture.remove()

      this.camFace = this.camFace === 'environment' ? 'user' : 'environment';
      this.capture = this.p5.createCapture({
        video: {
          // width: { min: 320, ideal: 640 },
          // height: { min: 240, ideal: 480 },
          facingMode: {
            ideal: this.camFace
          }
        },
        audio: false
      }, () => {
        console.log(
          this.$refs['sketch'].clientWidth, this.$refs['sketch'].clientHeight,
          this.capture.elt.videoWidth, this.capture.elt.videoHeight
        );
      });
      this.capture.hide();
    }
  },
}

</script>

<style scoped lang="scss">
</style>
