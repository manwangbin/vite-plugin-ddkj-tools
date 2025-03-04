<template>
    <Card hoverable>
      <div class="dashboard-card">
        <div class="card-title">{{ title }}</div>
        <div class="card-value" :style="{ color: color || '#40a9ff' }">{{ value }}</div>
        <div v-if="trend" class="card-trend">
          <span :style="{ color: trend.startsWith('-') ? '#ff4d4f' : '#52c41a' }">
            {{ trend }} ↑
          </span>
        </div>
      </div>
    </Card>
  </template>
  
  <script setup>
  import { Card } from 'ant-design-vue';
  defineProps({
    title: String,
    value: [Number, String],
    trend: String,
    color: String
  });
  </script>
  
  <style scoped>
  .dashboard-card {
    text-align: center;
    padding: 16px;
  }
  
  .card-title {
    color: #8c8c8c;
    font-size: 14px;
  }
  
  .card-value {
    font-size: 28px;
    margin: 8px 0;
    font-weight: bold;
  }
  
  .card-trend {
    font-size: 12px;
  }
  </style>