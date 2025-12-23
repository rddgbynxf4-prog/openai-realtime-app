const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const status = document.getElementById('status');
const transcript = document.getElementById('transcript');
const errorDiv = document.getElementById('error');

let mediaStream = null;

async function connectSession() {
  try {
    connectBtn.disabled = true;
    clearError();
    addMessage('System', 'Verbindung wird hergestellt...');

    const response = await fetch('/api/realtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Fehler beim Verbinden');
    }

    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    addMessage('System', 'Mit OpenAI Realtime API verbunden! 🎉');
    updateStatus(true);
    disconnectBtn.disabled = false;

  } catch (error) {
    console.error('Connection error:', error);
    showError('Fehler: ' + error.message);
    connectBtn.disabled = false;
  }
}

function disconnectSession() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
  }
  
  updateStatus(false);
  connectBtn.disabled = false;
  disconnectBtn.disabled = true;
  addMessage('System', 'Verbindung getrennt.');
}

function updateStatus(connected) {
  if (connected) {
    status.textContent = 'Status: Verbunden ✓';
    status.className = 'status connected';
  } else {
    status.textContent = 'Status: Getrennt';
    status.className = 'status disconnected';
  }
}

function addMessage(role, text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role.toLowerCase() === 'user' ? 'user' : 'assistant'}`;
  
  const label = document.createElement('div');
  label.className = 'message-label';
  label.textContent = role === 'System' ? '⚙️ System' : (role === 'user' ? '👤 Du' : '🤖 Assistent');
  
  const text_elem = document.createElement('div');
  text_elem.className = 'message-text';
  text_elem.textContent = text;
  
  messageDiv.appendChild(label);
  messageDiv.appendChild(text_elem);
  
  transcript.appendChild(messageDiv);
  transcript.scrollTop = transcript.scrollHeight;
  
  const emptyMsg = transcript.querySelector('.transcript-empty');
  if (emptyMsg) emptyMsg.remove();
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function clearError() {
  errorDiv.style.display = 'none';
  errorDiv.textContent = '';
}

connectBtn.addEventListener('click', connectSession);
disconnectBtn.addEventListener('click', disconnectSession);