/**
 * Calculate the competition status based on the competition date
 * @param {string} eventDate -  Event date in 'YYYY-MM-DD' format
 * @returns {string} - 'upcoming' | 'ongoing' | 'finished'
 */
export function calculateEventStatus(eventDate) {
  if (!eventDate) return 'upcoming'
  
  const today = new Date()
  today.setHours(0, 0, 0, 0) // ReSet to midnight
  
  const event = new Date(eventDate)
  event.setHours(0, 0, 0, 0)
  
  const diffTime = event.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    // Event has ended
    return 'finished'
  } else if (diffDays === 0) {e
    // The event is ongoing today
    return 'ongoing'
  } else {
    // Event is upcoming
    return 'upcoming'
  }
}

/**
 * Add the calculated status for a single event
 * @param {Object} event - Event object
 * @returns {Object} - Event object with computedStatus property
 */
export function enrichEventWithStatus(event) {
  return {
    ...event,
    computedStatus: calculateEventStatus(event.date)
  }
}

/**
 * Batch add the calculated states to the event array
 * @param {Array} events - Event array
 * @returns {Array} - Event array with computedStatus propertys
 */
export function enrichEventsWithStatus(events) {
  return events.map(enrichEventWithStatus)
}

/**
 * The upcoming matches will be filtered.
 * @param {Array} events - Event array
 * @returns {Array} - Upcoming event array sorted by date ascending
 */
export function getUpcomingEvents(events) {
  return enrichEventsWithStatus(events)
    .filter(event => event.computedStatus === 'upcoming')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

/**
 * Filter ongoing competitions
 * @param {Array} events - Event array
 * @returns {Array} - Ongoing event array
 */
export function getOngoingEvents(events) {
  return enrichEventsWithStatus(events)
    .filter(event => event.computedStatus === 'ongoing')
}

/**
 * Filter finished competitions
 * @param {Array} events - Event array
 * @returns {Array} - Finished event array sorted by date descending
 */
export function getFinishedEvents(events) {
  return enrichEventsWithStatus(events)
    .filter(event => event.computedStatus === 'finished')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

