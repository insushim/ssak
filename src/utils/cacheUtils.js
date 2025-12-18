// ============================================
// 공통 캐시 유틸리티 - 모든 서비스에서 재사용
// ============================================

/**
 * 캐시 유효성 검사 (jitter 포함)
 * @param {number} timestamp - 캐시 저장 시간
 * @param {number} ttl - Time To Live (밀리초)
 * @returns {boolean}
 */
export function isCacheValid(timestamp, ttl) {
  if (!timestamp || !ttl) return false;
  // 10% jitter 추가로 thundering herd 방지
  const jitter = ttl * 0.1 * Math.random();
  return (Date.now() - timestamp) < (ttl + jitter);
}

/**
 * LocalStorage에 데이터 저장
 * @param {string} prefix - 서비스별 접두사 (예: 'ssak_user_')
 * @param {string} key - 캐시 키
 * @param {any} data - 저장할 데이터
 */
export function saveToLocalStorage(prefix, key, data) {
  try {
    const item = { data, timestamp: Date.now() };
    localStorage.setItem(prefix + key, JSON.stringify(item));
  } catch (e) {
    // 용량 초과 시 무시
  }
}

/**
 * LocalStorage에서 데이터 로드
 * @param {string} prefix - 서비스별 접두사
 * @param {string} key - 캐시 키
 * @param {number} ttl - Time To Live (밀리초)
 * @returns {any|null}
 */
export function loadFromLocalStorage(prefix, key, ttl) {
  try {
    const item = localStorage.getItem(prefix + key);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (isCacheValid(parsed.timestamp, ttl)) {
      return parsed.data;
    }
    localStorage.removeItem(prefix + key);
  } catch (e) {
    // 파싱 에러 시 무시
  }
  return null;
}

/**
 * LocalStorage에서 특정 키 삭제
 * @param {string} prefix - 서비스별 접두사
 * @param {string} key - 캐시 키
 */
export function removeFromLocalStorage(prefix, key) {
  try {
    localStorage.removeItem(prefix + key);
  } catch (e) {
    // 무시
  }
}

/**
 * LocalStorage에서 특정 접두사로 시작하는 모든 키 삭제
 * @param {string} prefix - 서비스별 접두사
 */
export function clearLocalStorageByPrefix(prefix) {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    keys.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    // 무시
  }
}

/**
 * 캐시 관리 클래스 - 메모리 + LocalStorage 이중 캐시
 */
export class CacheManager {
  constructor(prefix, defaultTtl = 3600000) {
    this.prefix = prefix;
    this.defaultTtl = defaultTtl;
    this.memoryCache = new Map();
  }

  /**
   * 캐시에서 데이터 조회 (메모리 → LocalStorage → null)
   * @param {string} key
   * @param {number} ttl
   * @returns {any|null}
   */
  get(key, ttl = this.defaultTtl) {
    // 1. 메모리 캐시 확인
    const memCached = this.memoryCache.get(key);
    if (memCached && isCacheValid(memCached.timestamp, ttl)) {
      return memCached.data;
    }

    // 2. LocalStorage 캐시 확인
    const lsData = loadFromLocalStorage(this.prefix, key, ttl);
    if (lsData) {
      // 메모리 캐시에 복사
      this.memoryCache.set(key, { data: lsData, timestamp: Date.now() });
      return lsData;
    }

    return null;
  }

  /**
   * 캐시에 데이터 저장 (메모리 + LocalStorage)
   * @param {string} key
   * @param {any} data
   */
  set(key, data) {
    const timestamp = Date.now();
    this.memoryCache.set(key, { data, timestamp });
    saveToLocalStorage(this.prefix, key, data);
  }

  /**
   * 특정 키 캐시 무효화
   * @param {string} key
   */
  invalidate(key) {
    this.memoryCache.delete(key);
    removeFromLocalStorage(this.prefix, key);
  }

  /**
   * 전체 캐시 무효화
   */
  clear() {
    this.memoryCache.clear();
    clearLocalStorageByPrefix(this.prefix);
  }
}

// ============================================
// 기본 TTL 설정 (서비스별 참조용)
// ============================================
export const DEFAULT_TTL = {
  USER_DATA: 3600000,      // 1시간
  CLASS_DATA: 7200000,     // 2시간
  ASSIGNMENTS: 7200000,    // 2시간
  WRITINGS: 7200000,       // 2시간
  SCHEDULER: 7200000,      // 2시간
  NICKNAMES: 14400000,     // 4시간
  RANKINGS: 7200000,       // 2시간
  WRITING_DETAIL: 14400000 // 4시간
};

// ============================================
// LocalStorage 접두사 (서비스별)
// ============================================
export const LS_PREFIX = {
  USER: 'ssak_user_',
  CLASS: 'ssak_class_',
  ASSIGNMENT: 'ssak_assign_',
  WRITING: 'ssak_writing_',
  SCHEDULER: 'ssak_sched_'
};
