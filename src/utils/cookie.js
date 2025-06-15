export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export const setCookie = (name, value, days = 7, domain = '') => {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value || ''}${expires}; path=/; ${domain ? `domain=${domain};` : ''} Secure; SameSite=Lax`;
}

export const removeCookie = (name, domain = '') => {
    document.cookie = `${name}=; Max-Age=0; path=/; ${domain ? `domain=${domain};` : ''}`;
}
