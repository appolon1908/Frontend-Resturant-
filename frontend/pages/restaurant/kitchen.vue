<script setup lang="ts">
definePageMeta({ layout: 'restaurant' })
const tickets = ref([
  { id: 1, title: 'Ticket #101', subtitle: '2x Pasta, 1x Soup', status: 'preparing' },
  { id: 2, title: 'Ticket #102', subtitle: '1x Burger, 1x Salad', status: 'queued' },
])
</script>

<template>
  <section class="space-y-4">
    <h1 class="section-title">Kitchen</h1>
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <KitchenTicketCard v-for="ticket in tickets" :key="ticket.id" :title="ticket.title" :subtitle="ticket.subtitle" :status="ticket.status" />
    </div>
  </section>
</template>
