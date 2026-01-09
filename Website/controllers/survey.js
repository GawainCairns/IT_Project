// Client-side survey helpers
// These functions call REST endpoints expected on the server:
//  GET  /api/surveys?userId=...      -> list surveys for a user
//  DELETE /api/surveys/:id           -> delete a survey
//  PUT  /api/surveys/:id             -> update a survey

function _validateId(id) {
    return Number.isInteger(id) && id > 0;
}

function _validateSurveyDetails(details) {
    if (!details || typeof details !== 'object') return { ok: false, error: 'Invalid details' };
    if (!details.title || typeof details.title !== 'string' || details.title.trim().length === 0) {
        return { ok: false, error: 'Title is required' };
    }
    if (details.title.length > 255) return { ok: false, error: 'Title is too long' };
    if (details.description && typeof details.description !== 'string') return { ok: false, error: 'Description must be a string' };
    return { ok: true };
}

async function viewSurveysByUser(userId) {
    if (!_validateId(userId)) throw new Error('Invalid userId');

    const url = `/api/surveys?userId=${encodeURIComponent(userId)}`;
    const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch surveys: ${res.status} ${text}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Unexpected response format');
    return data;
}

async function deleteSurveyById(surveyId, confirmBefore = true) {
    if (!_validateId(surveyId)) throw new Error('Invalid surveyId');

    if (confirmBefore) {
        const ok = window.confirm('Are you sure you want to delete this survey? This action cannot be undone.');
        if (!ok) return { success: false, message: 'Deletion cancelled' };
    }

    const res = await fetch(`/api/surveys/${encodeURIComponent(surveyId)}`, { method: 'DELETE' });
    if (res.status === 404) return { success: false, message: 'Survey not found' };
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to delete survey: ${res.status} ${text}`);
    }
    return { success: true, message: 'Survey deleted' };
}

async function editSurveyById(surveyId, newDetails) {
    if (!_validateId(surveyId)) throw new Error('Invalid surveyId');
    const v = _validateSurveyDetails(newDetails);
    if (!v.ok) return { success: false, message: v.error };

    const res = await fetch(`/api/surveys/${encodeURIComponent(surveyId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ title: newDetails.title.trim(), description: newDetails.description || '' })
    });

    if (res.status === 404) return { success: false, message: 'Survey not found' };
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to update survey: ${res.status} ${text}`);
    }

    const data = await res.json();
    return { success: true, message: 'Survey updated', survey: data };
}

// Expose for other scripts
window.surveyAPI = { viewSurveysByUser, deleteSurveyById, editSurveyById };