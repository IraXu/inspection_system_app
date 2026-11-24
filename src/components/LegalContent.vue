<template>
  <div class="legal-content">
    <section v-for="(section, sectionIndex) in sections" :key="sectionIndex" class="legal-block">
      <h2 class="legal-block-title">{{ section.title }}</h2>

      <template v-for="(block, blockIndex) in section.blocks" :key="blockIndex">
        <h3 v-if="block.type === 'h'" class="legal-subtitle">{{ block.text }}</h3>
        <p v-else-if="block.type === 'p'" class="legal-paragraph">{{ block.text }}</p>
        <ul v-else-if="block.type === 'ul'" class="legal-list">
          <li v-for="(item, itemIndex) in block.items" :key="itemIndex">{{ item }}</li>
        </ul>
        <ol v-else-if="block.type === 'ol'" class="legal-list legal-list--ordered">
          <li v-for="(item, itemIndex) in block.items" :key="itemIndex">{{ item }}</li>
        </ol>
        <div v-else-if="block.type === 'table'" class="legal-table-wrap">
          <table class="legal-table">
            <thead>
              <tr>
                <th v-for="(header, headerIndex) in block.headers" :key="headerIndex">
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
defineProps({
  sections: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.legal-block {
  margin-top: 20px;
}

.legal-block:first-child {
  margin-top: 0;
}

.legal-block-title {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  font-weight: 700;
  color: #17181d;
}

.legal-subtitle {
  margin: 14px 0 0;
  font-size: 13.5px;
  line-height: 1.6;
  font-weight: 600;
  color: #2b2d36;
}

.legal-paragraph {
  margin: 8px 0 0;
  font-size: 13.5px;
  line-height: 1.9;
  color: #5b5c66;
}

.legal-list {
  margin: 8px 0 0;
  padding-left: 20px;
  color: #5b5c66;
  font-size: 13.5px;
  line-height: 1.9;
}

.legal-list--ordered {
  padding-left: 22px;
}

.legal-list li + li {
  margin-top: 4px;
}

.legal-table-wrap {
  margin-top: 10px;
  overflow-x: auto;
  border: 1px solid #eceef4;
  border-radius: 12px;
}

.legal-table {
  width: 100%;
  min-width: 520px;
  border-collapse: collapse;
  font-size: 12px;
  line-height: 1.6;
  color: #5b5c66;
}

.legal-table th,
.legal-table td {
  padding: 9px 10px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid #eceef4;
}

.legal-table th {
  font-weight: 600;
  color: #2b2d36;
  background: #f6f7fb;
  white-space: nowrap;
}

.legal-table tbody tr:last-child td {
  border-bottom: 0;
}
</style>
