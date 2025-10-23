# Chrome Extension - Complete DISC Analysis Display

## API Endpoint to Use

```
GET http://localhost:5000/api/linked/disc/latest/:userId
```

## Complete Chrome Extension Implementation

### 1. Fetch Analysis Results

```javascript
async function fetchCompleteAnalysis(userId) {
  try {
    const response = await fetch(`http://localhost:5000/api/linked/disc/latest/${userId}`);
    
    if (!response.ok) {
      throw new Error('No analysis found');
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data; // Complete analysis object
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return null;
  }
}
```

### 2. Display Complete Analysis in Chrome Extension

```javascript
function displayCompleteAnalysis(analysis) {
  const container = document.getElementById('analysis-results');
  
  if (!analysis) {
    container.innerHTML = '<div class="error">No analysis available. Please analyze LinkedIn data first.</div>';
    return;
  }
  
  container.innerHTML = `
    <div class="analysis-container">
      
      <!-- Header with Confidence Score -->
      <div class="analysis-header">
        <h2>DISC Profile Analysis</h2>
        <div class="confidence-badge ${getConfidenceClass(analysis.confidence.overall)}">
          <span class="confidence-label">Confidence</span>
          <span class="confidence-value">${analysis.confidence.overall}%</span>
        </div>
      </div>

      <!-- Executive Summary -->
      <section class="section executive-summary">
        <h3>📊 Executive Summary</h3>
        <p class="summary-text">${analysis.executive.summary}</p>
        <div class="key-insights">
          <h4>Key Insights:</h4>
          <ul>
            ${analysis.executive.keyInsights.map(insight => `<li>${insight}</li>`).join('')}
          </ul>
        </div>
      </section>

      <!-- DISC Personality Profile -->
      <section class="section personality-profile">
        <h3>👤 Personality Profile</h3>
        
        <!-- DISC Scores Chart -->
        <div class="disc-chart">
          ${renderDISCChart(analysis.personality.discScores)}
        </div>

        <!-- Dominant Type -->
        <div class="dominant-type">
          <strong>Primary Type:</strong> 
          <span class="type-badge ${analysis.personality.dominantType.toLowerCase()}">
            ${analysis.personality.dominantType}
          </span>
          ${analysis.personality.secondaryType ? `
            <strong>Secondary:</strong>
            <span class="type-badge ${analysis.personality.secondaryType.toLowerCase()}">
              ${analysis.personality.secondaryType}
            </span>
          ` : ''}
        </div>

        <!-- Personality Bullets -->
        <div class="personality-bullets">
          <h4>Key Traits:</h4>
          <ul class="trait-list">
            ${analysis.personality.bullets.map(bullet => `
              <li class="trait-item">
                <span class="bullet-icon">▸</span>
                ${bullet}
              </li>
            `).join('')}
          </ul>
        </div>
      </section>

      <!-- Talking Points -->
      <section class="section talking-points">
        <h3>💡 Strategic Talking Points</h3>
        <div class="points-grid">
          ${analysis.talkingPoints.map(point => `
            <div class="talking-point">
              <div class="point-header">
                <span class="point-topic">${point.topic}</span>
                <span class="point-priority priority-${point.priority.toLowerCase()}">${point.priority}</span>
              </div>
              <p class="point-description">${point.point}</p>
              ${point.context ? `<p class="point-context"><em>${point.context}</em></p>` : ''}
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Opening Scripts -->
      <section class="section opening-scripts">
        <h3>📝 Opening Scripts</h3>
        <div class="scripts-tabs">
          <div class="tab-buttons">
            <button class="tab-btn active" data-channel="linkedin">LinkedIn</button>
            <button class="tab-btn" data-channel="email">Email</button>
            <button class="tab-btn" data-channel="phone">Phone</button>
            <button class="tab-btn" data-channel="whatsapp">WhatsApp</button>
          </div>
          <div class="tab-content">
            ${renderOpeningScripts(analysis.openingScripts)}
          </div>
        </div>
      </section>

      <!-- Objection Handling -->
      <section class="section objection-handling">
        <h3>🛡️ Objection Handling</h3>
        <div class="objections-list">
          ${analysis.objectionHandling.map(obj => `
            <div class="objection-card">
              <div class="objection-header">
                <span class="objection-type">${obj.objection}</span>
              </div>
              <div class="response-section">
                <strong>Response:</strong>
                <p>${obj.response}</p>
              </div>
              ${obj.technique ? `
                <div class="technique-tag">
                  <em>Technique: ${obj.technique}</em>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Personalization Cues -->
      <section class="section personalization-cues">
        <h3>🎯 Personalization Cues</h3>
        <div class="cues-grid">
          ${analysis.personalizationCues.map(cue => `
            <div class="cue-card">
              <div class="cue-type">${cue.type}</div>
              <div class="cue-value">${cue.cue}</div>
              ${cue.context ? `<div class="cue-context">${cue.context}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Next Actions -->
      <section class="section next-actions">
        <h3>🚀 Recommended Next Actions</h3>
        <div class="actions-timeline">
          ${analysis.nextActions.map((action, index) => `
            <div class="action-item">
              <div class="action-number">${index + 1}</div>
              <div class="action-content">
                <div class="action-header">
                  <strong>${action.action}</strong>
                  <span class="action-timing">${action.timing}</span>
                </div>
                ${action.reasoning ? `<p class="action-reasoning">${action.reasoning}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Confidence Breakdown -->
      <section class="section confidence-breakdown">
        <h3>📈 Confidence Breakdown</h3>
        <div class="confidence-metrics">
          ${renderConfidenceMetrics(analysis.confidence.breakdown)}
        </div>
      </section>

      <!-- Analysis Metadata -->
      <div class="analysis-footer">
        <small>
          Analyzed: ${new Date(analysis.analysisMetadata.timestamp).toLocaleString()} | 
          Posts: ${analysis.analysisMetadata.postsAnalyzed} | 
          Product: ${analysis.productDescription.substring(0, 50)}...
        </small>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="btn-primary" onclick="copyAnalysisToClipboard()">
          📋 Copy to Clipboard
        </button>
        <button class="btn-secondary" onclick="exportAnalysisToPDF()">
          📄 Export PDF
        </button>
        <button class="btn-secondary" onclick="shareAnalysis()">
          🔗 Share
        </button>
      </div>

    </div>
  `;
  
  // Initialize tab functionality
  initializeTabs();
}

// Helper: Render DISC Chart
function renderDISCChart(scores) {
  const maxScore = Math.max(scores.dominance, scores.influence, scores.steadiness, scores.conscientiousness);
  
  return `
    <div class="disc-bars">
      <div class="disc-bar-item">
        <div class="disc-label">D (Dominance)</div>
        <div class="disc-bar-container">
          <div class="disc-bar dominance" style="width: ${(scores.dominance / maxScore * 100)}%">
            ${scores.dominance}%
          </div>
        </div>
      </div>
      <div class="disc-bar-item">
        <div class="disc-label">I (Influence)</div>
        <div class="disc-bar-container">
          <div class="disc-bar influence" style="width: ${(scores.influence / maxScore * 100)}%">
            ${scores.influence}%
          </div>
        </div>
      </div>
      <div class="disc-bar-item">
        <div class="disc-label">S (Steadiness)</div>
        <div class="disc-bar-container">
          <div class="disc-bar steadiness" style="width: ${(scores.steadiness / maxScore * 100)}%">
            ${scores.steadiness}%
          </div>
        </div>
      </div>
      <div class="disc-bar-item">
        <div class="disc-label">C (Conscientiousness)</div>
        <div class="disc-bar-container">
          <div class="disc-bar conscientiousness" style="width: ${(scores.conscientiousness / maxScore * 100)}%">
            ${scores.conscientiousness}%
          </div>
        </div>
      </div>
    </div>
  `;
}

// Helper: Render Opening Scripts
function renderOpeningScripts(scripts) {
  return `
    <div class="tab-panel active" data-channel="linkedin">
      <div class="script-content">
        <p>${scripts.find(s => s.channel === 'LinkedIn')?.script || 'No script available'}</p>
      </div>
    </div>
    <div class="tab-panel" data-channel="email">
      <div class="script-content">
        <p>${scripts.find(s => s.channel === 'Email')?.script || 'No script available'}</p>
      </div>
    </div>
    <div class="tab-panel" data-channel="phone">
      <div class="script-content">
        <p>${scripts.find(s => s.channel === 'Phone')?.script || 'No script available'}</p>
      </div>
    </div>
    <div class="tab-panel" data-channel="whatsapp">
      <div class="script-content">
        <p>${scripts.find(s => s.channel === 'WhatsApp')?.script || 'No script available'}</p>
      </div>
    </div>
  `;
}

// Helper: Render Confidence Metrics
function renderConfidenceMetrics(breakdown) {
  const metrics = [
    { label: 'Data Completeness', value: breakdown.completeness, icon: '📋' },
    { label: 'Sample Quality', value: breakdown.sampleQuality, icon: '⭐' },
    { label: 'Data Recency', value: breakdown.recency, icon: '🕐' },
    { label: 'Signal Agreement', value: breakdown.agreement, icon: '🎯' },
    { label: 'Signal Strength', value: breakdown.signalStrength, icon: '💪' }
  ];
  
  return metrics.map(metric => `
    <div class="metric-item">
      <div class="metric-header">
        <span class="metric-icon">${metric.icon}</span>
        <span class="metric-label">${metric.label}</span>
      </div>
      <div class="metric-bar-container">
        <div class="metric-bar" style="width: ${metric.value}%">
          ${metric.value}%
        </div>
      </div>
    </div>
  `).join('');
}

// Helper: Get Confidence Class
function getConfidenceClass(score) {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

// Initialize Tab Functionality
function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const channel = button.dataset.channel;
      
      // Remove active class from all
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));
      
      // Add active class to selected
      button.classList.add('active');
      document.querySelector(`.tab-panel[data-channel="${channel}"]`).classList.add('active');
    });
  });
}

// Copy to Clipboard
function copyAnalysisToClipboard() {
  const analysisText = document.querySelector('.analysis-container').innerText;
  navigator.clipboard.writeText(analysisText).then(() => {
    alert('Analysis copied to clipboard!');
  });
}

// Export to PDF (placeholder)
function exportAnalysisToPDF() {
  alert('PDF export functionality - integrate with jsPDF library');
}

// Share Analysis (placeholder)
function shareAnalysis() {
  alert('Share functionality - integrate with Web Share API');
}
```

### 3. Complete CSS Styling

```css
.analysis-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #ffffff;
  border-radius: 12px;
}

/* Header */
.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.analysis-header h2 {
  margin: 0;
  font-size: 28px;
  color: #111827;
}

.confidence-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
}

.confidence-badge.high { background: #10b981; color: white; }
.confidence-badge.medium { background: #f59e0b; color: white; }
.confidence-badge.low { background: #ef4444; color: white; }

.confidence-value {
  font-size: 24px;
  margin-top: 4px;
}

/* Sections */
.section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #1f2937;
  font-size: 20px;
}

/* Executive Summary */
.summary-text {
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 16px;
}

.key-insights ul {
  list-style: none;
  padding: 0;
}

.key-insights li {
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
  color: #4b5563;
}

.key-insights li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: bold;
}

/* DISC Chart */
.disc-bars {
  margin: 20px 0;
}

.disc-bar-item {
  margin-bottom: 16px;
}

.disc-label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #374151;
  font-size: 14px;
}

.disc-bar-container {
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  height: 32px;
}

.disc-bar {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  transition: width 0.5s ease;
}

.disc-bar.dominance { background: #dc2626; }
.disc-bar.influence { background: #f59e0b; }
.disc-bar.steadiness { background: #10b981; }
.disc-bar.conscientiousness { background: #3b82f6; }

/* Dominant Type */
.dominant-type {
  margin: 16px 0;
  font-size: 15px;
}

.type-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 600;
  margin: 0 4px;
  font-size: 13px;
}

.type-badge.dominance { background: #fef2f2; color: #dc2626; }
.type-badge.influence { background: #fffbeb; color: #f59e0b; }
.type-badge.steadiness { background: #f0fdf4; color: #10b981; }
.type-badge.conscientiousness { background: #eff6ff; color: #3b82f6; }

/* Personality Bullets */
.trait-list {
  list-style: none;
  padding: 0;
}

.trait-item {
  padding: 10px 0;
  display: flex;
  align-items: start;
  color: #374151;
  line-height: 1.5;
}

.bullet-icon {
  color: #3b82f6;
  margin-right: 8px;
  font-weight: bold;
}

/* Talking Points */
.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.talking-point {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.point-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.point-topic {
  font-weight: 600;
  color: #111827;
}

.point-priority {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.priority-high { background: #fee2e2; color: #dc2626; }
.priority-medium { background: #fef3c7; color: #f59e0b; }
.priority-low { background: #dbeafe; color: #3b82f6; }

.point-description {
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.point-context {
  margin-top: 8px;
  font-size: 13px;
  color: #6b7280;
}

/* Opening Scripts Tabs */
.scripts-tabs {
  margin: 16px 0;
}

.tab-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #3b82f6;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-panel {
  display: none;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.tab-panel.active {
  display: block;
}

.script-content p {
  line-height: 1.7;
  color: #374151;
  margin: 0;
  white-space: pre-wrap;
}

/* Objection Handling */
.objections-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.objection-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.objection-header {
  margin-bottom: 12px;
}

.objection-type {
  font-weight: 600;
  color: #dc2626;
  font-size: 15px;
}

.response-section {
  margin-bottom: 12px;
}

.response-section strong {
  color: #10b981;
}

.response-section p {
  margin: 6px 0 0;
  color: #4b5563;
  line-height: 1.6;
}

.technique-tag {
  font-size: 13px;
  color: #6b7280;
}

/* Personalization Cues */
.cues-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.cue-card {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #8b5cf6;
}

.cue-type {
  font-size: 12px;
  color: #8b5cf6;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 6px;
}

.cue-value {
  color: #111827;
  font-weight: 500;
  margin-bottom: 6px;
}

.cue-context {
  font-size: 13px;
  color: #6b7280;
}

/* Next Actions Timeline */
.actions-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-item {
  display: flex;
  gap: 16px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.action-number {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.action-timing {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.action-reasoning {
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

/* Confidence Breakdown */
.confidence-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-item {
  background: white;
  padding: 12px;
  border-radius: 6px;
}

.metric-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.metric-icon {
  font-size: 18px;
  margin-right: 8px;
}

.metric-label {
  font-weight: 500;
  color: #374151;
}

.metric-bar-container {
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  height: 24px;
}

.metric-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  padding: 0 8px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  transition: width 0.5s ease;
}

/* Footer */
.analysis-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  text-align: center;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 30px;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.error {
  padding: 20px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  text-align: center;
}
```

### 4. Usage in Chrome Extension

```javascript
// In your Chrome extension popup or content script
document.addEventListener('DOMContentLoaded', async () => {
  // Get userId from storage or context
  const userId = 'USER_ID_HERE'; // Replace with actual user ID
  
  // Fetch and display analysis
  const analysis = await fetchCompleteAnalysis(userId);
  displayCompleteAnalysis(analysis);
});
```

## API Response Structure

The endpoint returns:

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "user": "...",
    "linkedinContent": {...},
    "productDescription": "...",
    "executive": {
      "summary": "...",
      "keyInsights": [...]
    },
    "personality": {
      "discScores": {
        "dominance": 75,
        "influence": 60,
        "steadiness": 45,
        "conscientiousness": 70
      },
      "dominantType": "Dominance",
      "secondaryType": "Conscientiousness",
      "bullets": [...]
    },
    "talkingPoints": [...],
    "openingScripts": [...],
    "objectionHandling": [...],
    "personalizationCues": [...],
    "nextActions": [...],
    "confidence": {
      "overall": 85,
      "breakdown": {...}
    },
    "analysisMetadata": {...}
  }
}
```

## Testing

Test the endpoint using:
```bash
curl http://localhost:5000/api/linked/disc/latest/USER_ID_HERE
```

Replace `USER_ID_HERE` with actual user ID from your database.
