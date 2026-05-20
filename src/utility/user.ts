
export function getOrCreateUserId(): string {
    
    let userId = localStorage.getItem('user'); 
    
    if (!userId) {
        userId = crypto.randomUUID();
        
        localStorage.setItem('user', userId);
    }
    
    return userId;
}