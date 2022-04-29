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
      <el-descriptions-item label="Sim Name">{{ history.sim_name }}</el-descriptions-item>
      <el-descriptions-item label="UID">{{ history.uid }}</el-descriptions-item>
      <el-descriptions-item label="Model Name">{{ history.model_name }}</el-descriptions-item>
      <el-descriptions-item label="Generator Name">{{ history.gen_name }}</el-descriptions-item>
      <el-descriptions-item label="Status">
        <span :style="{color: statusColor(history.status)}">{{ statusText(history.status) }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="Create Time">{{ dateFormat(history.create_time * 1000) }}</el-descriptions-item>
      <el-descriptions-item label="Finish Time">{{ dateFormat(history.finish_time * 1000) }}</el-descriptions-item>
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
import { HistroyInterface, TrafficServer } from '@/network/server'
import store from '@/store'

export default defineComponent({
  name: 'History',
  props: ['drawer'],
  emits: ['update:drawer'],
  data () {
    return {
      mDrawer: false,
      historyData: [] as HistroyInterface[]
    }
  },
  watch: {
    mDrawer () {
      if (this.mDrawer) {
        this.getHistory()
      }
      this.$emit('update:drawer', this.mDrawer)
    },
    drawer () {
      this.mDrawer = this.drawer
    }
  },
  computed: {
    server () {
      return store.state.server as TrafficServer
    }
  },
  methods: {
    getHistory () {
      this.server.getHistory().then((value) => {
        if (value !== null) {
          this.historyData.length = 0
          value.forEach((pvalue) => {
            this.historyData.push(pvalue)
          })
        }
      })
    },
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
