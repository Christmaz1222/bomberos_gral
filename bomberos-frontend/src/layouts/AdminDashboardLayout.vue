<template>
  <div class="min-h-screen bg-surface font-body-md text-body-md text-on-surface">
    <AdminSidebar />
    <div class="pl-72 min-h-screen flex flex-col">
      <AdminHeader />
      <main class="w-full pt-16 bg-surface px-space-lg py-space-lg flex-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from '../components/admin/AdminSidebar.vue'
import AdminHeader from '../components/admin/AdminHeader.vue'
</script>
