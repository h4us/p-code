<template>
<div id="app">
  <v-p5 ref="p5"></v-p5>
  <!-- // -->
  <div style="width:100vw; background:transparent; position:fixed; top:0; left:0; bottom:0;">
    <div class="nav-like">
      <section class="nav-header">
        <el-form :inline="true">
          <el-form-item label="Play">
            <el-switch :width="60" v-model="isPlaying"></el-switch>
          </el-form-item>
          <el-form-item label="Loop">
            <el-switch :width="60" v-model="doLoop"></el-switch>
          </el-form-item>
        </el-form>
      </section>
      <!-- // -->
      <section style="position:relative;">
        <el-button circle @click="toggleDrawer">
          <i class="el-icon-camera-solid"></i>
        </el-button>
      </section>
    </div>
  </div>
  <!-- // -->
  <el-drawer
    :visible.sync="drawer"
    direction="btt"
    size="50%">
    <div class="capture-opt-1">
      <el-radio-group size="small" v-model="flipCamera">
        <el-radio-button label="user">FRONT</el-radio-button>
        <el-radio-button label="environment">REAR</el-radio-button>
      </el-radio-group>
    </div>
    <div class="capture-preview"
         :style="{ backgroundImage: 'url(' + filteredSnapshot + ')' }">
      <el-form class="capture-opt-2">
        <el-form-item>
          <el-slider v-model="threashold"
                     @change="recognize"
                     :min="0"
                     :max="1"
                     :step="0.01"></el-slider>
        </el-form-item>
      </el-form>
    </div>
  </el-drawer>

  <!-- // -->
  <div class="mini-editor" :class="{ enabled: drawer }">
    <section class="nav-header">
      <el-form :inline="true">
        <el-form-item label="Play">
          <el-switch :width="60" v-model="isPlaying"></el-switch>
        </el-form-item>
        <el-form-item label="Loop">
          <el-switch :width="60" v-model="doLoop"></el-switch>
        </el-form-item>
      </el-form>
    </section>
    <el-tabs v-model="editableTabsValue"
             type="card"
             class="mini-editor-tab"
             closable
             @tab-remove="removeTab">
      <el-tab-pane
        v-for="(item) in editableTabs"
        :key="item.name"
        :label="item.title"
        :name="item.name"
        >
        <el-input type="textarea" v-model="item.content"></el-input>
      </el-tab-pane>
    </el-tabs>
  </div>
</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import VueP5 from '@/components/VueP5';

export default {
  name: 'app',

  data() {
    return {
      tImg: '',
      editableTabsValue: '1',
      editableTabs: [{
        title: 'P-Code Sample',
        name: '1',
        content: 'Hello World! 440~~~~~~'
      }],
      tabIndex: 1
    }
  },

  computed: {
    drawer: {
      get() {
        return this.$store.state.drawer;
      },
      set(v) {
        this.toggleDrawer(v);
      }
    },
    flipCamera: {
      get() {
        return this.$store.state.camFace;
      },
      set(v) {
        this.camFaceAction(v);
      }
    },
    isPlaying: {
      get() {
        return this.$store.state.isPlaying;
      },
      set(v) {
        this.togglePlay(v);
      }
    },
    doLoop: {
      get() {
        return this.$store.state.doLoop;
      },
      set(v) {
        this.toggleLoop(v);
      }
    },
    threashold: {
      get() {
        return this.$store.state.threashold;
      },
      set(v) {
        this.threasholdAction(v);
      }
    },
    ...mapState([
      'filteredSnapshot'
    ])
  },

  components: {
    'v-p5': VueP5
  },

  mounted() {
    this.$store.subscribeAction((action, state) => {
      if ((action.type == 'drawerAction' && action.payload !== false) ||
          (action.type == 'camFaceAction' && state.drawer)) {
        this.recognize();
      }

      if (action.type == 'scanedCodeAction') {
        // this.recognize();
        console.log(action.payload);
        const notFound = this.editableTabs.findIndex((tab) => tab.content === action.payload);
        if (notFound < 0) {
          this.addTab(action.payload);
        }
      }

      if (action.type == 'isPlayingAction') {
        let tabs = this.editableTabs;
        let activeName = this.editableTabsValue;
        const uTabIdx = tabs.findIndex(tab => tab.name === activeName);
        console.log('playgin!', action.payload, uTabIdx);
        if (uTabIdx > -1 && action.payload) {
          console.log('!!', this.editableTabs[uTabIdx].content);
          this.$refs['p5'].recieveFromExternal(this.editableTabs[uTabIdx].content);
        }
      }
    });
  },

  methods: {
    async recognize() {
      this.$refs['p5'].takeSnapshot();
      this.tImg = this.$refs['p5'].getFilteredImage();
      await this.$refs['p5'].recognize();
    },

    // handleClick(tab, e) {
    //   console.log(tab, e);
    // },

    addTab(content) {
      let newTabName = ++this.tabIndex + '';
      this.editableTabs.push({
        title: newTabName,
        name: newTabName,
        content: content
      });
      this.editableTabsValue = newTabName;
    },

    removeTab(targetName) {
      let tabs = this.editableTabs;
      let activeName = this.editableTabsValue;
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.name;
            }
          }
        });
      }

      this.editableTabsValue = activeName;
      this.editableTabs = tabs.filter(tab => tab.name !== targetName);
    },

    updateTab(newContent) {
      let tabs = this.editableTabs;
      let activeName = this.editableTabsValue;
      const uTabIdx = tabs.findIndex(tab => tab.name === activeName);
      if (uTabIdx > -1) {
        this.editableTabs.splice(uTabIdx, 1, {
          title: this.editableTabs[uTabIdx].title,
          name: this.editableTabs[uTabIdx].name,
          content: newContent
        });
      }
    },

    ...mapActions([
      'camFaceAction',
      'threasholdAction'
    ]),
    ...mapActions({
      toggleDrawer: 'drawerAction',
      togglePlay: 'isPlayingAction',
      toggleLoop: 'doLoopAction'
    })
  }
}
</script>

<style lang="scss">
#app {
    margin: 0;

    .nav-like {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        height: 100%;

        > section {
            padding: 1rem;
        }

        .nav-header {
            width: 100%;
            display: flex;
            justify-content: space-around;
        }
    }

    .mini-editor {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 50%;
        z-index: 9999;
        background-color: rgba(255, 255, 255, .666);
        visibility: hidden;

        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;

        &.enabled {
            visibility: visible;
        }

        > section {
            padding: 1rem;
        }

        .nav-header {
            width: 100%;
            display: flex;
            justify-content: space-around;
        }

        .mini-editor-tab {
            width: 90%;
        }

        .el-tab-pane {
            height: 100%;

            .el-textarea,
            textarea {
                display: block;
                /* height: 100%; */
                height: 100%;
                background: transparent;
            }
        }
    }
}

.capture-opt-1 {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translate(-50%, 1rem);
}

.capture-opt-2 {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}

.capture-preview {
    padding: 0 1.5rem;
    width: 100%;
    height: 95%;
    overflow: scoll;
    margin: 0 0 1rem;
    display: block;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
}

</style>
