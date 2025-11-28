/**
 * 根据比赛日期计算比赛状态
 * @param {string} eventDate - 比赛日期 (YYYY-MM-DD 或 ISO 格式)
 * @returns {string} - 'upcoming' | 'ongoing' | 'finished'
 */
export function calculateEventStatus(eventDate) {
  if (!eventDate) return 'upcoming'
  
  const today = new Date()
  today.setHours(0, 0, 0, 0) // 重置时间为当天开始
  
  const event = new Date(eventDate)
  event.setHours(0, 0, 0, 0)
  
  const diffTime = event.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    // 比赛日期已过
    return 'finished'
  } else if (diffDays === 0) {
    // 今天是比赛日
    return 'ongoing'
  } else {
    // 比赛还未开始
    return 'upcoming'
  }
}

/**
 * 为事件对象添加计算后的状态
 * @param {Object} event - 事件对象
 * @returns {Object} - 带有 computedStatus 的事件对象
 */
export function enrichEventWithStatus(event) {
  return {
    ...event,
    computedStatus: calculateEventStatus(event.date)
  }
}

/**
 * 为事件数组批量添加计算后的状态
 * @param {Array} events - 事件数组
 * @returns {Array} - 带有 computedStatus 的事件数组
 */
export function enrichEventsWithStatus(events) {
  return events.map(enrichEventWithStatus)
}

/**
 * 过滤即将开始的比赛
 * @param {Array} events - 事件数组
 * @returns {Array} - 即将开始的比赛数组（按日期排序）
 */
export function getUpcomingEvents(events) {
  return enrichEventsWithStatus(events)
    .filter(event => event.computedStatus === 'upcoming')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

/**
 * 过滤进行中的比赛
 * @param {Array} events - 事件数组
 * @returns {Array} - 进行中的比赛数组
 */
export function getOngoingEvents(events) {
  return enrichEventsWithStatus(events)
    .filter(event => event.computedStatus === 'ongoing')
}

/**
 * 过滤已结束的比赛
 * @param {Array} events - 事件数组
 * @returns {Array} - 已结束的比赛数组（按日期倒序）
 */
export function getFinishedEvents(events) {
  return enrichEventsWithStatus(events)
    .filter(event => event.computedStatus === 'finished')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

