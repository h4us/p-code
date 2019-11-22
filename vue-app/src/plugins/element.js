import Vue from 'vue';
import {
  Button, Switch, Slider,
  Tabs, TabPane,
  Radio, RadioButton, RadioGroup,
  Input,
  Form, FormItem,
  Drawer
} from 'element-ui';
import lang from 'element-ui/lib/locale/lang/ja';
import locale from 'element-ui/lib/locale';

import '../app.scss';

locale.use(lang);

Vue.use(Button);
Vue.use(Switch);
Vue.use(Slider);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Radio);
Vue.use(RadioButton);
Vue.use(RadioGroup);
Vue.use(Input);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Drawer);
