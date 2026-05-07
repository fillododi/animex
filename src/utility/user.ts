import { STORAGE_USER_KEY } from './constants';

export function getOrCreateUserId(): string {
    
    let userId = localStorage.getItem(STORAGE_USER_KEY); 
    
    if (!userId) {
        userId = crypto.randomUUID();
        
        localStorage.setItem(STORAGE_USER_KEY, userId);
    }
    
    return userId;
}