/*
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-08-02 14:11:34
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-27 13:45:37
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\components\basicComponents\index.js
 * @Description: 组件配置
 */
import Vue from 'vue'
import '@geip/basic-components/lib/theme-default/index.css'
import {
  Alert,
  MessageBox,
  Message,
  Table,
  TableColumn,
  Tabs,
  TabPane,
  Dialog,
  Select,
  Option,
  Form,
  Drawer,
  Pagination,
  DatePicker,
  Checkbox,
  Radio,
  Button,
  Upload,
  FormItem,
  Input,
  CheckboxGroup,
  RadioGroup,
  Row,
  Col,
  ButtonGroup,
  Progress,
  Tooltip,
  InputNumber,
  Popover,
  timeSelect,
  Card,
  RadioButton,
  Loading,
  Carousel,
  CarouselItem,
  Notification,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Main,
  Container,
  Tree,
  Switch,
  Popconfirm,
  Slider,
  Cascader
} from '@geip/basic-components'

const components = {
  Alert,
  Tabs,
  TabPane,
  Dialog,
  Select,
  Option,
  Form,
  Drawer,
  Radio,
  Pagination,
  DatePicker,
  Checkbox,
  Table,
  TableColumn,
  Button,
  Upload,
  FormItem,
  Input,
  CheckboxGroup,
  RadioGroup,
  Row,
  Col,
  ButtonGroup,
  Progress,
  Tooltip,
  InputNumber,
  timeSelect,
  Popover,
  Card,
  RadioButton,
  Carousel,
  CarouselItem,
  Notification,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Main,
  Container,
  Tree,
  Switch,
  Popconfirm,
  Slider,
  Cascader
}
for (const [, val] of Object.entries(components)) {
  Vue.component(val.name, val)
}

Vue.use(Loading.directive)
Vue.prototype.$loading = Loading.service
Vue.prototype.$msgbox = MessageBox
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$notify = Notification
Vue.prototype.$message = Message
