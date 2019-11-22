import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    camFace: 'environment',
    captureMode: 'camera',
    isPlaying: false,
    threashold: 0.5,
    doLoop: false,
    drawer: false,
    filteredSnapshot: '',
    scanedCode: '',
    pCodes: [],
  },

  mutations: {
    camFace(state) {
      state.camFace = state.camFace === 'environment' ? 'user' : 'environment';
    },
    camFaceTo(state, to) {
      state.camFace = to;
    },

    isPlaying(state) {
      state.isPlaying = !state.isPlaying;
    },
    isPlayingTo(state, torf) {
      state.isPlaying = torf;
    },

    doLoop(state) {
      state.doLoop = !state.isPlaying;
    },
    doLoopTo(state, torf) {
      state.doLoop = torf;
    },

    drawer(state) {
      state.drawer = !state.drawer;
    },
    drawerTo(state, torf) {
      state.drawer = torf;
    },

    threashold(state, n) {
      state.threashold = n;
    },

    filteredSnapshot(state, n) {
      state.filteredSnapshot = n;
    },

    addPCodes(state, p) {
      state.pCodes.push(p);
    },

    disposePCodes(state, i) {
      state.pCodes.splice(i, 1);
    },

    scanedCode(state, p) {
      state.scanedCode = p;
    },
  },

  actions: {
    camFaceAction(ctx, cam = '') {
      if (cam === 'environment' || cam === 'user') {
        ctx.commit('camFaceTo', cam);
      } else {
        ctx.commit('camFace');
      }
    },

    isPlayingAction(ctx, torf = null) {
      if (typeof torf === 'boolean') {
        ctx.commit('isPlayingTo', torf);
      } else {
        ctx.commit('isPlaying');
      }
    },

    doLoopAction(ctx, torf = null) {
      if (typeof torf === 'boolean') {
        ctx.commit('doLoopTo', torf);
      } else {
        ctx.commit('doLoop');
      }
    },

    drawerAction(ctx, torf = null) {
      if (typeof torf === 'boolean') {
        ctx.commit('drawerTo', torf);
      } else {
        ctx.commit('drawer');
      }
    },

    threasholdAction(ctx, n) {
      ctx.commit('threashold', n);
    },

    filteredSnapshotAction(ctx, n) {
      ctx.commit('filteredSnapshot', n);
    },

    scanedCodeAction(ctx, n) {
      ctx.commit('scanedCode', n);
    }
  }
});
