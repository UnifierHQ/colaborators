async function fetchTeamData() {
  try {
    const response = await fetch('https://collab.unifierhq.org/data.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching team data:', error);
    return {};
  }
}

function createTeamMemberCard(id, memberData) {
  const card = document.createElement('div');
  card.className = 'team-member';
  
  card.innerHTML = `
    <img 
      src="https://collab.unifierhq.org/pfp/${id}.png" 
      alt="${memberData.displayname}'s profile picture"
      class="member-image"
      onerror="this.src='https://collab.unifierhq.org/pfp/unifier.webp'"
    >
    <div class="member-info">
      <h2 class="member-name">${memberData.displayname}</h2>
      <p class="member-role">${memberData.icon} ${memberData.role}</p>
    </div>
  `;
  
  return card;
}

async function initializeTeamGallery() {
  const teamContainer = document.getElementById('team-members');
  const teamData = await fetchTeamData();
  
  if (Object.keys(teamData).length === 0) {
    teamContainer.innerHTML = '<p>Unable to load team data. Please try again later.</p>';
    return;
  }
  
  Object.entries(teamData)
    .filter(([id, member]) => {
      const isAlias = id.toLowerCase().includes('aliases');
      const isNote = id.toLowerCase().includes('_note');
      const isHidden = member.hidden === 'web' || member.hidden === 'both';
      return !isAlias && !isHidden && !isNote;
    })
    .forEach(([id, memberData]) => {
      const card = createTeamMemberCard(id, memberData);
      teamContainer.appendChild(card);
    });
}

async function updateTeamList() {
  const teamContainer = document.getElementById('team-members');
  const currentTeamData = await fetchTeamData();
  
  if (Object.keys(currentTeamData).length === 0) {
    console.error('Unable to load team data.');
    return;
  }

  const newTeamData = await fetchTeamData();
  
  if (JSON.stringify(currentTeamData) !== JSON.stringify(newTeamData)) {
    if (navigator.onLine) {
      location.reload();
    } else {
      console.warn('No internet connection. Cannot reload the page.');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeTeamGallery();
  setInterval(updateTeamList, 900000); // Update every 15 mins.
});
