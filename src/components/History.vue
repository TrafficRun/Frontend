<template>
<el-drawer v-model="mDrawer">
<template #title>
  <h4>History</h4>
</template>
<template #default>
<el-scrollbar max-height="700px">
  <div
    v-for="history in historyData"
    :key="history.uid"
  >
    <el-descriptions
      :column="1"
      :title="history.sim_name"
      border
    >
      <template #extra>
        <el-button :disabled="history.status === 0"> 下载 </el-button>
      </template>
      <el-descriptions-item label="UID">{{ history.uid }}</el-descriptions-item>
      <el-descriptions-item label="Model Name">{{ history.model_name }}</el-descriptions-item>
      <el-descriptions-item label="Generator Name">{{ history.gen_name }}</el-descriptions-item>
      <el-descriptions-item label="Status">
        <span :style="{color: statusColor(history.status)}">{{ statusText(history.status) }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="Create Time">{{ dateFormat(history.create_time) }}</el-descriptions-item>
      <el-descriptions-item label="Finish Time">{{ dateFormat(history.finish_time) }}</el-descriptions-item>
    </el-descriptions>
    <el-divider></el-divider>
  </div>
</el-scrollbar>
</template>
<template #footer>
  <el-divider />
  <el-button type="primary">Close</el-button>
</template>
</el-drawer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { HistroyInterface } from '@/network/server'

export default defineComponent({
  name: 'History',
  props: ['drawer'],
  emits: ['update:drawer'],
  data () {
    return {
      mDrawer: false,
      historyData: [{
        sid: 1,
        sim_name: 'online_gapi_compute_1',
        uid: 'f72ccda0-a8eb-efb4-a979-57d8ccdb7338',
        root_dir: 'f72ccda0-a8eb-efb4-a979-57d8ccdb7338',
        model_name: 'online_gapi',
        gen_name: 'random_generator',
        status: 1,
        create_time: 1649686207,
        finish_time: 1649686882
      }, {
        sid: 1,
        sim_name: 'sco_compute_1',
        uid: '20e03a81-0d0a-6841-e3af-2ce7e8cc735d',
        root_dir: '20e03a81-0d0a-6841-e3af-2ce7e8cc735d',
        model_name: 'sco',
        gen_name: 'random_generator',
        status: 2,
        create_time: 1649676207,
        finish_time: 1649676882
      }] as HistroyInterface[]
    }
  },
  watch: {
    mDrawer () {
      this.$emit('update:drawer', this.mDrawer)
    },
    drawer () {
      this.mDrawer = this.drawer
    }
  },
  methods: {
    statusText (status : number) {
      if (status === 0) {
        return 'Running'
      } else if (status === 1) {
        return 'Finish'
      } else {
        return 'Error'
      }
    },
    statusColor (status : number) {
      if (status === 0) {
        return '#67C23A'
      } else if (status === 1) {
        return '#409EFF'
      } else {
        return '#F56C6C'
      }
    },
    dateFormat (timestamp : number) : string {
      return (new Date(timestamp)).toDateString()
    }
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
