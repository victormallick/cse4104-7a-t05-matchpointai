/**
 * User-Scoped Storage Utility
 * Prevents cross-account data leakage by isolating and scoping all cached
 * resume results, scan histories, saved jobs, and interview questions to the active user UUID.
 */

const USER_DATA_PREFIXES = [
  'matchpoint_history',
  'matchpoint_latest_result',
  'matchpoint_saved_jobs',
  'matchpoint_saved_questions',
  'matchpoint_target_role',
  'matchpoint_user_',
  'matchpoint_interview_answers_',
  'matchpoint_interview_questions_'
];

/**
 * Completely purges all candidate data from localStorage upon logout or account switch.
 */
export const clearUserStorage = (specificUserId = null) => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (USER_DATA_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        if (!specificUserId || key.includes(specificUserId)) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (err) {
    console.warn('Storage purge warning:', err);
  }
};

/**
 * Get latest analysis result scoped strictly to the current user.
 */
export const getLatestResult = (currentUserId) => {
  try {
    // 1. Check user-namespaced key first
    if (currentUserId) {
      const userKey = `matchpoint_${currentUserId}_latest_result`;
      const userRaw = localStorage.getItem(userKey);
      if (userRaw) {
        const parsed = JSON.parse(userRaw);
        if (parsed && typeof parsed === 'object' && (parsed.analysis_id || parsed.id || parsed.ats_score !== undefined)) {
          return parsed;
        }
      }
    }

    // 2. Check global latest result
    const raw = localStorage.getItem('matchpoint_latest_result');
    if (raw) {
      const result = JSON.parse(raw);
      if (result && typeof result === 'object' && (result.analysis_id || result.id || result.ats_score !== undefined)) {
        if (!currentUserId || !result.user_id || result.user_id === currentUserId || result.user_id === 'demo-user') {
          return result;
        }
      }
    }

    // 3. Fallback to first item in user history
    const history = getUserHistory(currentUserId);
    if (Array.isArray(history) && history.length > 0) {
      const first = history[0];
      if (first && typeof first === 'object') return first;
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Save latest analysis result tagged with current user id.
 */
export const setLatestResult = (result, currentUserId) => {
  try {
    if (!result) {
      localStorage.removeItem('matchpoint_latest_result');
      if (currentUserId) localStorage.removeItem(`matchpoint_${currentUserId}_latest_result`);
      return;
    }
    const scoped = {
      ...result,
      user_id: currentUserId || result.user_id || 'demo-user'
    };
    localStorage.setItem('matchpoint_latest_result', JSON.stringify(scoped));
    if (currentUserId) {
      localStorage.setItem(`matchpoint_${currentUserId}_latest_result`, JSON.stringify(scoped));
    }
  } catch (err) {
    console.warn('Failed to save latest result:', err);
  }
};

/**
 * Deduplicates scan history list by unique ID or role/timestamp.
 */
export const deduplicateHistory = (list) => {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const result = [];
  for (const item of list) {
    if (!item) continue;
    const key = item.analysis_id || item.id || `${item.job_title}_${item.company}_${item.analyzed_at || item.created_at || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
};

/**
 * Get scan history scoped to current user.
 */
export const getUserHistory = (currentUserId) => {
  try {
    if (currentUserId) {
      const userKey = `matchpoint_${currentUserId}_history`;
      const userRaw = localStorage.getItem(userKey);
      if (userRaw) {
        const list = JSON.parse(userRaw);
        if (Array.isArray(list)) return deduplicateHistory(list);
      }
    }

    const raw = localStorage.getItem('matchpoint_history');
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    if (!currentUserId) return deduplicateHistory(list);
    return deduplicateHistory(list.filter((item) => !item.user_id || item.user_id === currentUserId));
  } catch {
    return [];
  }
};

/**
 * Save scan history for current user.
 */
export const setUserHistory = (history, currentUserId) => {
  try {
    if (!Array.isArray(history)) return;
    const clean = deduplicateHistory(history).map((item) => ({
      ...item,
      user_id: currentUserId || item.user_id || 'demo-user'
    }));
    localStorage.setItem('matchpoint_history', JSON.stringify(clean));
    if (currentUserId) {
      localStorage.setItem(`matchpoint_${currentUserId}_history`, JSON.stringify(clean));
    }
  } catch (err) {
    console.warn('Failed to save history:', err);
  }
};

/**
 * Get saved jobs count for current user.
 */
export const getSavedJobs = (currentUserId) => {
  try {
    const key = currentUserId ? `matchpoint_saved_jobs_${currentUserId}` : 'matchpoint_saved_jobs';
    const raw = localStorage.getItem(key) || '[]';
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

/**
 * Get saved questions count for current user.
 */
export const getSavedQuestions = (currentUserId) => {
  try {
    const key = currentUserId ? `matchpoint_saved_questions_${currentUserId}` : 'matchpoint_saved_questions';
    const raw = localStorage.getItem(key) || '[]';
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};
