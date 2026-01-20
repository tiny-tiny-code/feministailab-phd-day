const SUPABASE_URL = 'https://dmbnetpjpcyvgdmrnqvd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtYm5ldHBqcGN5dmdkbXJucXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NTEyMDAsImV4cCI6MjA4MzIyNzIwMH0.xX2Nfi4GW49cHOom2pV_lM8qs2vwA4DbFrjvpj88Ai0';

// Get table name from script tag's data attribute, default to 'community_notes'
const scriptTag = document.currentScript;
const TABLE_NAME = scriptTag?.dataset?.table || 'community_notes';

async function loadNotes() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (response.ok) {
      const notes = await response.json();
      displayNotes(notes);
    } else {
      console.error('Failed to load notes');
      document.getElementById('loading').textContent = 'Failed to load notes';
    }
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('loading').textContent = 'Error loading notes';
  }
}

function displayNotes(notes) {
  const loading = document.getElementById('loading');
  const notesContainer = document.getElementById('notes');
  const empty = document.getElementById('empty');

  loading.style.display = 'none';

  if (notes.length === 0) {
    empty.style.display = 'block';
    notesContainer.style.display = 'none';
  } else {
    empty.style.display = 'none';
    notesContainer.style.display = 'flex';
    notesContainer.innerHTML = notes.map(note => `
      <div class="postit">
        ${note.text}
        <button class="delete-btn" onclick="deleteNote('${note.id}')">×</button>
      </div>
    `).join('');
  }
}

async function addNote() {
  const textarea = document.getElementById('noteText');
  const text = textarea.value.trim();
  
  if (!text) return;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ text })
    });

    if (response.ok) {
      textarea.value = '';
      closeModal();
      loadNotes();
    } else {
      alert('Failed to add note. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error adding note. Please try again.');
  }
}

async function deleteNote(id) {
  if (!confirm('Are you sure you want to delete this note?')) return;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (response.ok) {
      loadNotes();
    } else {
      alert('Failed to delete note.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error deleting note.');
  }
}

function openModal() {
  document.getElementById('modal').classList.add('active');
  document.getElementById('noteText').focus();
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
  document.getElementById('noteText').value = '';
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Load notes on page load
loadNotes();