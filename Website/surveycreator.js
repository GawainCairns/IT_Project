// Minimal Survey Creator
document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main');
    // ensure the survey UI is centered on the page
    main.classList.add('creator-main');
    
    // build the UI structure inside <main> element
    main.innerHTML = `
        <h1>Create a Survey</h1>
        <div id="survey-settings" class="card">
            <label>Title: <input id="survey-title" placeholder="Untitled survey"></label>
            <label>Description: <input id="survey-description" placeholder="Optional description"></label>
        </div>

        <div class="controls">
            <button id="add-question">+ Add Question</button>
            <button id="preview-survey">Preview</button>
            <button id="export-json">Export JSON</button>
        </div>

        <div id="questions"></div>

        <div id="export-area" style="display:none">
            <h3>Exported JSON</h3>
            <textarea id="export-json-text" rows="10" style="width:100%"></textarea>
        </div>    
    `;

    // references to key elements
    const questionsEl = document.getElementById('questions');
    const addQuestionBtn = document.getElementById('add-question');
    const previewBtn = document.getElementById('preview-survey');
    const exportBtn = document.getElementById('export-json');

    // question ID counter
    let questionIdCounter = 1;

    // function to create a question card element
    function createQuestionCard(initial = {}) {
        const id = questionIdCounter++;
        const q = document.createElement('div');
        q.className = 'question-card card';
        q.dataset.id = id;
        q.innerHTML = `
            <div class="q-header">
                <strong>Question</strong>
                <div class="q-controls">
                    <button class="move-up">▲</button>
                    <button class="move-down">▼</button>
                    <button class="delete">🗑</button>
                </div>
            </div>

            <label>Type:
                <select class="q-type">
                    <option value="text">Short answer</option>
                    <option value="textarea">Long answer</option>
                    <option value="radio">Multiple choice (single)</option>
                    <option value="checkbox">Multiple choice (multi)</option>
                </select>
            </label>
            <label>Question text: <input class="q-text" placeholder="Enter question"></label>
            <label>Description: <input class="q-desc" placeholder="Optional hint"></label>
            <div class="options-area" style="display:none">
                <div class="options-list"></div>
                <button class="add-option">+ Add option</button>
            </div>
        `;

        // set initial values
        if (initial.type) q.querySelector('.q-type').value = initial.type;
        if (initial.text) q.querySelector('.q-text').value = initial.text;
        if (initial.desc) q.querySelector('.q-desc').value = initial.desc;
        if (initial.options && initial.options.length) {
            q.querySelector('.q-type').value = initial.type || 'radio';
            const optsArea = q.querySelector('.options-area');
            optsArea.style.display = 'block';
            const optsList = q.querySelector('.options-list');
            initial.options.forEach(o => appendOption(optsList, o));
        }

        // event handlers
        q.querySelector('.q-type').addEventListener('change', (e) => {
            const v = e.target.value;
            const optsArea = q.querySelector('.options-area');
            if (v === 'radio' || v === 'checkbox') optsArea.style.display = 'block';
            else optsArea.style.display = 'none';
        });

        q.querySelector('.add-option').addEventListener('click', (e) => {
            const list = q.querySelector('.options-list');
            appendOption(list, '');
        });

        q.querySelector('.delete').addEventListener('click', () => q.remove());
        q.querySelector('.move-up').addEventListener('click', () => {
            const prev = q.previousElementSibling;
            if (prev) questionsEl.insertBefore(q, prev);
        });
        q.querySelector('.move-down').addEventListener('click', () => {
            const next = q.nextElementSibling;
            if (next) questionsEl.insertBefore(next, q);
        });

        return q;
    }

    // function to append an option item to options list
    function appendOption(listEl, value) {
        const item = document.createElement('div');
        item.className = 'option-item';
        item.innerHTML = `
            <input class="opt-text" placeholder="Option text">
            <button class="opt-delete">✖</button>
            <button class="opt-up">▲</button>
            <button class="opt-down">▼</button>
        `;
        item.querySelector('.opt-text').value = value || '';
        item.querySelector('.opt-delete').addEventListener('click', () => item.remove());
        item.querySelector('.opt-up').addEventListener('click', () => {
            const prev = item.previousElementSibling;
            if (prev) listEl.insertBefore(item, prev);
        });
        item.querySelector('.opt-down').addEventListener('click', () => {
            const next = item.nextElementSibling;
            if (next) listEl.insertBefore(next, item);
        });
        listEl.appendChild(item);
    }

    // event listeners for main buttons
    addQuestionBtn.addEventListener('click', () => {
        const card = createQuestionCard();
        questionsEl.appendChild(card);
    });

    // export survey as JSON
    exportBtn.addEventListener('click', () => {
        const data = buildSurveyObject();
        const exportArea = document.getElementById('export-area');
        const exportText = document.getElementById('export-json-text');
        exportText.value = JSON.stringify(data, null, 2);
        exportArea.style.display = 'block';
    });

    // preview survey
    previewBtn.addEventListener('click', () => {
        const data = buildSurveyObject();
        openPreview(data);
    });

    // function to build survey object from UI
    function buildSurveyObject() {
        const title = document.getElementById('survey-title').value || '';
        const description = document.getElementById('survey-description').value || '';
        const qs = [];
        document.querySelectorAll('.question-card').forEach(qEl => {
            const type = qEl.querySelector('.q-type').value;
            const text = qEl.querySelector('.q-text').value || '';
            const desc = qEl.querySelector('.q-desc').value || '';
            const obj = { type, text, desc };
            if (type === 'radio' || type === 'checkbox') {
                const opts = [];
                qEl.querySelectorAll('.options-list .opt-text').forEach(opt => opts.push(opt.value || ''));
                obj.options = opts;
            }
            qs.push(obj);
        });
        return { title, description, questions: qs };
    }

    // function to open preview window
    function openPreview(survey) {
        const w = window.open('', '_blank', 'width=700,height=800,scrollbars=1');
        const doc = w.document;
        doc.write(`<html><head><title>Preview - ${escapeHtml(survey.title)}</title><link rel="stylesheet" href="css/style.css"></head><body>`);
        doc.write(`<main><h1>${escapeHtml(survey.title)}</h1><p>${escapeHtml(survey.description)}</p><form>`);
        survey.questions.forEach((q, i) => {
            doc.write(`<div class="preview-q"><label><strong>${i+1}. ${escapeHtml(q.text)}</strong></label>`);
            if (q.desc) doc.write(`<div class="q-hint">${escapeHtml(q.desc)}</div>`);
            if (q.type === 'text') doc.write(`<input type="text" style="width:100%">`);
            else if (q.type === 'textarea') doc.write(`<textarea style="width:100%"></textarea>`);
            else if (q.type === 'radio') {
                q.options.forEach((opt, idx) => doc.write(`<div><label><input type="radio" name="q${i}"> ${escapeHtml(opt)}</label></div>`));
            }
            else if (q.type === 'checkbox') {
                q.options.forEach((opt, idx) => doc.write(`<div><label><input type="checkbox" name="q${i}"> ${escapeHtml(opt)}</label></div>`));
            }
            doc.write(`</div>`);
        });
        doc.write(`<div style="margin-top:1rem"><button type="button" onclick="window.close()">Close</button></div>`);
        doc.write(`</form></main></body></html>`);
        doc.close();
    }

    // function to escape HTML special characters
    function escapeHtml(s) {
        if (!s) return '';
        return s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]);
    }

    // add first sample question
    const sample = createQuestionCard({ type: 'text', text: 'What is your name?', desc: 'First and last name' });
    questionsEl.appendChild(sample);
});