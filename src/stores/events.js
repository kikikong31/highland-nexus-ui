import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { eventsApi } from '@/api/events'

export const useEventsStore = defineStore('events', () => {
  const events = ref([
    {
      id: 1,
      name: '投掷重锤比赛',
      nameEn: 'Hammer Throw',
      date: '2024-06-15',
      location: '爱丁堡城堡广场',
      locationEn: 'Edinburgh Castle Square',
      description: '传统的投掷重锤比赛，参赛者需要将16磅或22磅的重锤尽可能远地投掷出去。这是高地运动会最具代表性的项目之一。',
      descriptionEn: 'Traditional hammer throw competition where participants throw a 16 or 22-pound hammer as far as possible. One of the most iconic Highland Games events.',
      requirements: '年龄18岁以上，身体健康，有力量训练基础',
      requirementsEn: 'Age 18+, good health, strength training background',
      prize: '冠军：1000英镑，亚军：500英镑，季军：300英镑',
      prizeEn: '1st: £1000, 2nd: £500, 3rd: £300',
      maxParticipants: 50,
      currentParticipants: 32,
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800'
    },
    {
      id: 2,
      name: '抛木桩比赛',
      nameEn: 'Caber Toss',
      date: '2024-06-16',
      location: '格拉斯哥绿地公园',
      locationEn: 'Glasgow Green Park',
      description: '参赛者需要将一根长约19英尺、重约175磅的木桩垂直抛起并翻转，使其完全翻转180度。',
      descriptionEn: 'Participants must flip a 19-foot, 175-pound pole vertically, making it flip 180 degrees.',
      requirements: '年龄20岁以上，有相关训练经验',
      requirementsEn: 'Age 20+, relevant training experience',
      prize: '冠军：1200英镑，亚军：600英镑，季军：400英镑',
      prizeEn: '1st: £1200, 2nd: £600, 3rd: £400',
      maxParticipants: 40,
      currentParticipants: 28,
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800'
    },
    {
      id: 3,
      name: '拔河比赛',
      nameEn: 'Tug of War',
      date: '2024-06-17',
      location: '斯特灵运动场',
      locationEn: 'Stirling Stadium',
      description: '团队项目，每队8人，通过集体力量拉动对方队伍越过中线。这是一项考验团队协作和耐力的比赛。',
      descriptionEn: 'Team event with 8 members per team, pulling the opposing team across the centerline. A test of teamwork and endurance.',
      requirements: '年龄16岁以上，以团队形式报名',
      requirementsEn: 'Age 16+, register as a team',
      prize: '冠军队：2000英镑，亚军队：1000英镑',
      prizeEn: 'Winning team: £2000, Runner-up: £1000',
      maxParticipants: 16,
      currentParticipants: 16,
      status: 'ongoing',
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800'
    },
    {
      id: 4,
      name: '高地舞蹈表演',
      nameEn: 'Highland Dancing',
      date: '2024-05-20',
      location: '因弗内斯文化中心',
      locationEn: 'Inverness Cultural Center',
      description: '传统的苏格兰高地舞蹈表演和比赛，包括剑舞、高地舞等经典舞蹈形式。',
      descriptionEn: 'Traditional Scottish Highland dance performance and competition, including sword dance and highland fling.',
      requirements: '年龄不限，需有舞蹈基础',
      requirementsEn: 'No age limit, dance background required',
      prize: '冠军：800英镑，亚军：400英镑，季军：200英镑',
      prizeEn: '1st: £800, 2nd: £400, 3rd: £200',
      maxParticipants: 60,
      currentParticipants: 60,
      status: 'finished',
      image: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800'
    },
    {
      id: 5,
      name: '石头投掷比赛',
      nameEn: 'Stone Put',
      date: '2024-06-18',
      location: '阿伯丁海滨',
      locationEn: 'Aberdeen Beachfront',
      description: '参赛者使用一块重约16-22磅的石头进行投掷，类似于现代的铅球比赛，但使用天然石头。',
      descriptionEn: 'Participants throw a 16-22 pound stone, similar to modern shot put but using natural stones.',
      requirements: '年龄18岁以上，身体健康',
      requirementsEn: 'Age 18+, good health',
      prize: '冠军：900英镑，亚军：450英镑，季军：250英镑',
      prizeEn: '1st: £900, 2nd: £450, 3rd: £250',
      maxParticipants: 45,
      currentParticipants: 20,
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800'
    }
  ])

  const registrations = ref([])
  const winners = ref([
    {
      id: 1,
      eventId: 4,
      eventName: '高地舞蹈表演',
      eventNameEn: 'Highland Dancing',
      participantName: 'Fiona MacLeod',
      rank: 1,
      score: '95.5分',
      date: '2024-05-20'
    },
    {
      id: 2,
      eventId: 4,
      eventName: '高地舞蹈表演',
      eventNameEn: 'Highland Dancing',
      participantName: 'Ailsa Campbell',
      rank: 2,
      score: '92.3分',
      date: '2024-05-20'
    },
    {
      id: 3,
      eventId: 4,
      eventName: '高地舞蹈表演',
      eventNameEn: 'Highland Dancing',
      participantName: 'Moira Stewart',
      rank: 3,
      score: '89.7分',
      date: '2024-05-20'
    }
  ])

  const locations = ref([
    {
      id: 1,
      name: '爱丁堡城堡广场',
      nameEn: 'Edinburgh Castle Square',
      address: 'Castlehill, Edinburgh EH1 2NG',
      lat: 55.9486,
      lng: -3.1999
    },
    {
      id: 2,
      name: '格拉斯哥绿地公园',
      nameEn: 'Glasgow Green Park',
      address: 'Glasgow Green, Glasgow G40 1AT',
      lat: 55.8494,
      lng: -4.2343
    },
    {
      id: 3,
      name: '斯特灵运动场',
      nameEn: 'Stirling Stadium',
      address: 'Stirling FK9 4LA',
      lat: 56.1165,
      lng: -3.9369
    },
    {
      id: 4,
      name: '因弗内斯文化中心',
      nameEn: 'Inverness Cultural Center',
      address: 'Inverness IV1 1PF',
      lat: 57.4778,
      lng: -4.2247
    },
    {
      id: 5,
      name: '阿伯丁海滨',
      nameEn: 'Aberdeen Beachfront',
      address: 'Beach Promenade, Aberdeen AB24 5NR',
      lat: 57.1497,
      lng: -2.0943
    }
  ])

  // Getters
  const upcomingEvents = computed(() => 
    events.value.filter(e => e.status === 'upcoming')
  )

  const ongoingEvents = computed(() => 
    events.value.filter(e => e.status === 'ongoing')
  )

  const finishedEvents = computed(() => 
    events.value.filter(e => e.status === 'finished')
  )

  // Actions
  function getEventById(id) {
    return events.value.find(e => e.id === parseInt(id))
  }

  function addEvent(event) {
    const newEvent = {
      ...event,
      id: Math.max(...events.value.map(e => e.id)) + 1,
      currentParticipants: 0
    }
    events.value.push(newEvent)
  }

  function updateEvent(id, updatedEvent) {
    const index = events.value.findIndex(e => e.id === id)
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...updatedEvent }
    }
  }

  function deleteEvent(id) {
    const index = events.value.findIndex(e => e.id === id)
    if (index !== -1) {
      events.value.splice(index, 1)
    }
  }

  function addRegistration(registration) {
    const newRegistration = {
      ...registration,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    registrations.value.push(newRegistration)
    
    //  Update current participants count
    const event = events.value.find(e => e.id === registration.eventId)
    if (event) {
      event.currentParticipants++
    }
  }

  function updateRegistrationStatus(id, status) {
    const registration = registrations.value.find(r => r.id === id)
    if (registration) {
      registration.status = status
    }
  }

  function getUserRegistrations(userId) {
    return registrations.value.filter(r => r.userId === userId)
  }

  function addWinner(winner) {
    const newWinner = {
      ...winner,
      id: Math.max(...winners.value.map(w => w.id), 0) + 1
    }
    winners.value.push(newWinner)
  }

  function updateWinner(id, updatedWinner) {
    const index = winners.value.findIndex(w => w.id === id)
    if (index !== -1) {
      winners.value[index] = { ...winners.value[index], ...updatedWinner }
    }
  }

  function deleteWinner(id) {
    const index = winners.value.findIndex(w => w.id === id)
    if (index !== -1) {
      winners.value.splice(index, 1)
    }
  }

  function getLocationByName(name) {
    return locations.value.find(l => 
      l.name === name || l.nameEn === name
    )
  }

  // SET events list
  function setEvents(newEvents) {
    events.value = newEvents
  }

  // FETCH events from API
  async function fetchEvents(params = {}) {
    try {
      const response = await eventsApi.getEvents(params)
      if (response.success) {
        events.value = response.data.items
        return response.data
      }
    } catch (error) {
      console.error('Fetch events error:', error)
      throw error
    }
  }

  return {
    events,
    registrations,
    winners,
    locations,
    upcomingEvents,
    ongoingEvents,
    finishedEvents,
    getEventById,
    addEvent,
    updateEvent,
    deleteEvent,
    setEvents,
    fetchEvents,
    addRegistration,
    updateRegistrationStatus,
    getUserRegistrations,
    addWinner,
    updateWinner,
    deleteWinner,
    getLocationByName
  }
})

