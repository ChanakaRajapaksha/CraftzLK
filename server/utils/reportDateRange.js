const MS_DAY = 86400000;

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfWeek(d) {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  return x;
}

function getDateRange(preset, customStart, customEnd) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (preset) {
    case 'yesterday': {
      const start = new Date(todayStart.getTime() - MS_DAY);
      const end = new Date(todayStart.getTime() - 1);
      return { start, end };
    }
    case 'last7days':
      return { start: new Date(todayStart.getTime() - 6 * MS_DAY), end: todayEnd };
    case 'thisWeek':
      return { start: startOfWeek(now), end: todayEnd };
    case 'thisMonth':
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: todayEnd };
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start, end };
    }
    case 'thisYear':
      return { start: new Date(now.getFullYear(), 0, 1), end: todayEnd };
    case 'custom': {
      const start = customStart ? startOfDay(new Date(customStart)) : todayStart;
      const end = customEnd ? endOfDay(new Date(customEnd)) : todayEnd;
      return { start, end };
    }
    case 'today':
    default:
      return { start: todayStart, end: todayEnd };
  }
}

function parseOrderDate(order) {
  const raw = order?.date || order?.dateOrdered || order?.createdAt;
  const d = raw ? new Date(raw) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
}

function isInRange(date, start, end) {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function filterOrdersInRange(orders, start, end) {
  return orders.filter((order) => {
    const d = parseOrderDate(order);
    return d && isInRange(d, start, end);
  });
}

function parseAmount(value) {
  const n = parseFloat(String(value ?? 0).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function getPreviousDateRange(preset, customStart, customEnd) {
  const current = getDateRange(preset, customStart, customEnd);
  const duration = current.end.getTime() - current.start.getTime();
  const prevEnd = new Date(current.start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);
  return { start: prevStart, end: prevEnd };
}

function getComparisonLabel(preset) {
  const labels = {
    today: 'yesterday',
    yesterday: 'the day before',
    last7days: 'previous 7 days',
    thisWeek: 'last week',
    thisMonth: 'last month',
    lastMonth: 'previous month',
    thisYear: 'last year',
    custom: 'previous period',
  };
  return labels[preset] || 'previous period';
}

module.exports = {
  getDateRange,
  getPreviousDateRange,
  getComparisonLabel,
  parseOrderDate,
  filterOrdersInRange,
  parseAmount,
};
